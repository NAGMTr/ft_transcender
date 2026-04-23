import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    authService = new AuthService();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('should generate an OAuth authorization URL for Google', () => {
    process.env.OAUTH_GOOGLE_CLIENT_ID = 'google-client-id';
    process.env.OAUTH_GOOGLE_CLIENT_SECRET = 'google-client-secret';
    process.env.OAUTH_GOOGLE_REDIRECT_URI = 'http://localhost:3000/callback';

    const authorizationUrl = authService.getAuthorizationUrl('google');
    const url = new URL(authorizationUrl);

    expect(url.origin + url.pathname).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(url.searchParams.get('client_id')).toBe('google-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/callback',
    );
    expect(url.searchParams.get('scope')).toBe('openid profile email');
    expect(url.searchParams.get('state')).toBeTruthy();
  });

  it('should return normalized profile data after a GitHub callback', async () => {
    process.env.OAUTH_GITHUB_CLIENT_ID = 'github-client-id';
    process.env.OAUTH_GITHUB_CLIENT_SECRET = 'github-client-secret';
    process.env.OAUTH_GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';

    const authorizationUrl = authService.getAuthorizationUrl('github');
    const state = new URL(authorizationUrl).searchParams.get('state');

    const fetchMock = jest.spyOn(global, 'fetch' as never);
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: () => Promise.resolve({ access_token: 'oauth-access-token' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 42,
            login: 'octocat',
            name: 'Mona Octocat',
            email: 'mona@github.com',
            avatar_url: 'https://avatars.githubusercontent.com/u/1',
          }),
      } as Response);

    const result = await authService.authenticate(
      'github',
      'authorization-code',
      state ?? undefined,
    );

    expect(result).toEqual({
      provider: 'github',
      profile: {
        id: 42,
        login: 'octocat',
        name: 'Mona Octocat',
        email: 'mona@github.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/1',
      },
    });
  });

  it('should reject OAuth callback with invalid state', async () => {
    process.env.OAUTH_GITHUB_CLIENT_ID = 'github-client-id';
    process.env.OAUTH_GITHUB_CLIENT_SECRET = 'github-client-secret';
    process.env.OAUTH_GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';

    await expect(
      authService.authenticate('github', 'authorization-code', 'invalid-state'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw when provider is not configured', () => {
    expect(() => authService.getAuthorizationUrl('google')).toThrow(
      BadRequestException,
    );
  });
});
