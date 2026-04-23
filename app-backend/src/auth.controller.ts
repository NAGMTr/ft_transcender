import { Controller, Get, Param, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('providers')
  getProviders() {
    return this.authService.getAvailableProviders();
  }

  @Get('oauth/:provider')
  @Redirect(undefined, 302)
  startOAuth(@Param('provider') provider: string) {
    return {
      url: this.authService.getAuthorizationUrl(provider),
    };
  }

  @Get('oauth/:provider/callback')
  handleOAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code?: string,
    @Query('state') state?: string,
  ) {
    return this.authService.authenticate(provider, code, state);
  }
}
