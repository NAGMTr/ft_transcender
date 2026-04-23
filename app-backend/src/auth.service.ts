import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';

type ProviderId = 'google' | 'github' | '42';

interface ProviderDefinition {
  id: ProviderId;
  label: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scope: string;
}

interface ProviderSettings extends ProviderDefinition {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface AuthStatePayload {
  provider: ProviderId;
  ts: number;
}

const PROVIDERS: ProviderDefinition[] = [
  {
    id: 'google',
    label: 'Google',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid profile email',
  },
  {
    id: 'github',
    label: 'GitHub',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    userInfoEndpoint: 'https://api.github.com/user',
    scope: 'read:user user:email',
  },
  {
    id: '42',
    label: '42',
    authorizationEndpoint: 'https://api.intra.42.fr/oauth/authorize',
    tokenEndpoint: 'https://api.intra.42.fr/oauth/token',
    userInfoEndpoint: 'https://api.intra.42.fr/v2/me',
    scope: 'public',
  },
];

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {
  getAvailableProviders(): Array<{ id: ProviderId; label: string }> {
    return PROVIDERS.filter((provider) => this.isConfigured(provider.id)).map(
      ({ id, label }) => ({
        id,
        label,
      }),
    );
  }

  getAuthorizationUrl(providerParam: string): string {
    const settings = this.getProviderSettings(providerParam);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: settings.clientId,
      redirect_uri: settings.redirectUri,
      scope: settings.scope,
      state: this.createState(settings.id, settings.clientSecret),
    });

    if (settings.id === 'google') {
      params.set('prompt', 'select_account');
      params.set('access_type', 'online');
    }

    return `${settings.authorizationEndpoint}?${params.toString()}`;
  }

  async authenticate(providerParam: string, code?: string, state?: string) {
    if (!code || !state) {
      throw new BadRequestException('Missing OAuth callback parameters.');
    }

    const settings = this.getProviderSettings(providerParam);
    this.validateState(state, settings.id, settings.clientSecret);

    const accessToken = await this.exchangeCodeForToken(settings, code);
    const profile = await this.fetchProfile(settings, accessToken);

    return {
      provider: settings.id,
      profile: this.normalizeProfile(settings.id, profile),
    };
  }

  private getProviderSettings(providerParam: string): ProviderSettings {
    const provider = PROVIDERS.find(({ id }) => id === providerParam);
    if (!provider) {
      throw new NotFoundException('OAuth provider not supported.');
    }

    const clientId =
      process.env[`OAUTH_${provider.id.toUpperCase()}_CLIENT_ID`];
    const clientSecret =
      process.env[`OAUTH_${provider.id.toUpperCase()}_CLIENT_SECRET`];
    const redirectUri =
      process.env[`OAUTH_${provider.id.toUpperCase()}_REDIRECT_URI`];

    if (!clientId || !clientSecret || !redirectUri) {
      throw new BadRequestException(
        `OAuth provider "${provider.id}" is not configured.`,
      );
    }

    return {
      ...provider,
      clientId,
      clientSecret,
      redirectUri,
    };
  }

  private isConfigured(provider: ProviderId): boolean {
    return [
      process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`],
      process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_SECRET`],
      process.env[`OAUTH_${provider.toUpperCase()}_REDIRECT_URI`],
    ].every(Boolean);
  }

  private createState(provider: ProviderId, secret: string): string {
    const payload: AuthStatePayload = {
      provider,
      ts: Date.now(),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64url',
    );
    const signature = this.sign(encodedPayload, secret);
    return `${encodedPayload}.${signature}`;
  }

  private validateState(state: string, provider: ProviderId, secret: string) {
    const [encodedPayload, providedSignature] = state.split('.');
    if (!encodedPayload || !providedSignature) {
      throw new UnauthorizedException('Invalid OAuth state.');
    }

    const expectedSignature = this.sign(encodedPayload, secret);
    const signatureMatch = timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature),
    );

    if (!signatureMatch) {
      throw new UnauthorizedException('OAuth state validation failed.');
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as AuthStatePayload;

    const isExpired = Date.now() - payload.ts > OAUTH_STATE_TTL_MS;
    if (payload.provider !== provider || isExpired) {
      throw new UnauthorizedException('OAuth state expired or invalid.');
    }
  }

  private sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('base64url');
  }

  private async exchangeCodeForToken(
    settings: ProviderSettings,
    code: string,
  ): Promise<string> {
    const response = await fetch(settings.tokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: settings.clientId,
        client_secret: settings.clientSecret,
        code,
        redirect_uri: settings.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new UnauthorizedException('OAuth token exchange failed.');
    }

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? ((await response.json()) as Record<string, unknown>)
      : Object.fromEntries(
          new URLSearchParams(await response.text()).entries(),
        );

    const accessToken = payload.access_token;
    if (typeof accessToken !== 'string' || !accessToken) {
      throw new UnauthorizedException('Invalid OAuth token response.');
    }

    return accessToken;
  }

  private async fetchProfile(
    settings: ProviderSettings,
    accessToken: string,
  ): Promise<Record<string, unknown>> {
    const response = await fetch(settings.userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
        'User-Agent': 'ft_transcendence-oauth-client',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('OAuth profile retrieval failed.');
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private normalizeProfile(
    provider: ProviderId,
    profile: Record<string, unknown>,
  ) {
    if (provider === 'google') {
      return {
        id: profile.sub,
        login: profile.email,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.picture,
      };
    }

    if (provider === 'github') {
      return {
        id: profile.id,
        login: profile.login,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
      };
    }

    return {
      id: profile.id,
      login: profile.login,
      name: profile.displayname,
      email: profile.email,
      avatarUrl: this.get42AvatarUrl(profile),
    };
  }

  private get42AvatarUrl(profile: Record<string, unknown>) {
    if (typeof profile.image !== 'object' || !profile.image) {
      return undefined;
    }

    return (profile.image as { link?: string }).link;
  }
}
