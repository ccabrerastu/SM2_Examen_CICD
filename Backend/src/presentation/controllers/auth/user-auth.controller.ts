import { Controller, Post, Body, HttpStatus, HttpCode, Req, Res } from '@nestjs/common';
import { Public } from '../../../shared/guards/enhanced-jwt.guard';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';
import { UseRateLimit, RATE_LIMITS } from '../../../shared/guards/rate-limit.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { BaseAuthController } from './base-auth.controller';

// Use Cases
import { RegisterUserUseCase } from '../../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../../../application/use-cases/auth/logout-user.use-case';

// DTOs
import { RegisterDto } from '../../../application/dtos/auth/register.dto';
import { RegisterResponseDto } from '../../../application/dtos/auth/register-response.dto';
import { LoginDto } from '../../../application/dtos/auth/login.dto';
import { LoginResponseDto } from '../../../application/dtos/auth/login-response.dto';
import { RefreshResponseDto } from '../../../application/dtos/auth/refresh-response.dto';
import { LogoutResponseDto } from '../../../application/dtos/auth/logout-response.dto';

@ApiTags('Authentication - User Management')
@Controller('auth')
export class UserAuthController extends BaseAuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
  ) {
    super();
  }

  // =================== REGISTRATION ===================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.REGISTRATION)
  @ApiOperation({
    summary: 'Register a new user account',
    description:
      'Creates a new user account with email verification. Returns user details and access token but refresh token is set in HttpOnly cookie.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered. Verification email sent.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists with this email',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts. Please wait and try again.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() _request: Request,
    @Res({ passthrough: true }) _response: Response,
  ): Promise<RegisterResponseDto> {
    try {
      // Device and IP info extraction for future use
      // const _ipAddress = this.extractIpAddress(request);
      // const _userAgent = request.headers['user-agent'];
      // const _deviceInfo = this.extractDeviceInfo(_userAgent);

      this.logger.log(`Registration attempt for email: ${registerDto.email}`);

      const result = await this.registerUserUseCase.execute(registerDto);

      this.logger.log(`User registered successfully: ${result.userId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Registration failed for ${registerDto.email}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }

  // =================== LOGIN ===================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.LOGIN)
  @ApiOperation({
    summary: 'Login user with email and password',
    description:
      'Authenticates user and returns access token. Refresh token is set in HttpOnly cookie for security.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Please wait and try again.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    try {
      const ipAddress = this.extractIpAddress(request);
      const userAgent = request.headers['user-agent'];
      const deviceInfo = this.extractDeviceInfo(userAgent);

      this.logger.log(`Login attempt for email: ${loginDto.email}`);

      const loginResult = await this.loginUserUseCase.execute(
        loginDto,
        deviceInfo,
        userAgent,
        ipAddress,
      );

      // Set refresh token as HttpOnly cookie
      if (loginResult.refreshToken) {
        this.setRefreshTokenCookie(response, loginResult.refreshToken);
      }

      // Remove refresh token from response body for security
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { refreshToken: _, ...publicResponse } = loginResult;

      this.logger.log(`User logged in successfully: ${loginResult.userId}`);

      return publicResponse;
    } catch (error: unknown) {
      this.logger.error(
        `Login failed for ${loginDto.email}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }

  // =================== REFRESH TOKEN ===================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.TOKEN_REFRESH)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Rotates the refresh token and provides a new access token. Requires refresh token in HttpOnly cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts',
  })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponseDto> {
    try {
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        this.logger.warn('Refresh token attempt without token cookie');
        throw new Error('Refresh token not provided');
      }

      const ipAddress = this.extractIpAddress(request);
      const userAgent = request.headers['user-agent'];
      const deviceInfo = this.extractDeviceInfo(userAgent);

      this.logger.debug('Token refresh attempt');

      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
        deviceInfo,
        userAgent,
        ipAddress,
      });

      // Set new refresh token as HttpOnly cookie
      if (result.newRefreshToken) {
        this.setRefreshTokenCookie(response, result.newRefreshToken);
      }

      this.logger.debug(`Token refreshed successfully for user: ${result.userId}`);

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }

  // =================== LOGOUT ===================

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.LOGOUT)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Logout from current device',
    description: 'Invalidates the current refresh token and clears the authentication cookie.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponseDto> {
    try {
      const refreshToken = request.cookies?.refreshToken;

      if (!refreshToken) {
        this.logger.warn('Logout attempt without refresh token');
        // Clear cookie anyway and return success
        this.clearRefreshTokenCookie(response);
        return {
          success: true,
          message: 'Logged out successfully',
        };
      }

      const ipAddress = this.extractIpAddress(request);
      const userAgent = request.headers['user-agent'];
      const deviceInfo = this.extractDeviceInfo(userAgent);

      this.logger.debug('Logout attempt');

      const result = await this.logoutUserUseCase.logoutFromDevice({
        refreshToken,
        deviceInfo,
        userAgent,
        ipAddress,
      });

      // Always clear the refresh token cookie
      this.clearRefreshTokenCookie(response);

      this.logger.log('User logged out successfully');

      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Logout failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Always clear cookie on logout, even if there's an error
      this.clearRefreshTokenCookie(response);

      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }
}
