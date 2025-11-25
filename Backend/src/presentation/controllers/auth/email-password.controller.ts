import { Controller, Post, Get, Body, Query, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { Public } from '../../../shared/guards/enhanced-jwt.guard';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';
import { SkipOriginValidation } from '../../../shared/guards/origin-validation.guard';
import { UseRateLimit, RATE_LIMITS } from '../../../shared/guards/rate-limit.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { BaseAuthController } from './base-auth.controller';

// Use Cases
import { VerifyEmailUseCase } from '../../../application/use-cases/auth/verify-email.use-case';
import { ForgotPasswordUseCase } from '../../../application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../../application/use-cases/auth/reset-password.use-case';

// DTOs
import { VerifyEmailDto } from '../../../application/dtos/auth/verify-email.dto';
import { VerifyEmailResponseDto } from '../../../application/dtos/auth/verify-email-response.dto';
import { ResendVerificationDto } from '../../../application/dtos/auth/resend-verification.dto';
import { ResendVerificationResponseDto } from '../../../application/dtos/auth/resend-verification-response.dto';
import { ForgotPasswordDto } from '../../../application/dtos/auth/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../../../application/dtos/auth/forgot-password-response.dto';
import { ResetPasswordDto } from '../../../application/dtos/auth/reset-password.dto';
import { ResetPasswordResponseDto } from '../../../application/dtos/auth/reset-password-response.dto';

@ApiTags('Authentication - Email & Password Management')
@Controller('auth')
export class EmailPasswordController extends BaseAuthController {
  constructor(
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {
    super();
  }

  // =================== EMAIL VERIFICATION ===================

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.EMAIL_VERIFICATION)
  @ApiOperation({
    summary: 'Verify email with verification code',
    description: 'Verifies a user email address using the verification token sent via email.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    try {
      this.logger.log(
        `Email verification attempt for token: ${verifyEmailDto.token.substring(0, 8)}...`,
      );

      const result = await this.verifyEmailUseCase.execute(verifyEmailDto);

      this.logger.log(`Email verified successfully for user: ${result.userId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Email verification failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @SkipOriginValidation()
  @UseRateLimit(RATE_LIMITS.EMAIL_VERIFICATION)
  @ApiOperation({
    summary: 'Verify email via GET link (email link)',
    description: 'Alternative endpoint for email verification via GET request (for email links)',
  })
  @ApiQuery({ name: 'token', description: 'Email verification token', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid token' })
  async verifyEmailViaLink(@Query('token') token: string): Promise<VerifyEmailResponseDto> {
    return this.verifyEmail({ token });
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.EMAIL_VERIFICATION)
  @ApiOperation({
    summary: 'Resend email verification',
    description:
      'Sends a new verification email to the specified email address if it exists in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent (if email exists)',
    type: ResendVerificationResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many resend attempts',
  })
  async resendVerificationEmail(
    @Body() resendDto: ResendVerificationDto,
  ): Promise<ResendVerificationResponseDto> {
    try {
      this.logger.log(`Resend verification request for email: ${resendDto.email}`);

      const result = await this.verifyEmailUseCase.resendVerificationEmail(resendDto.email);

      this.logger.log(`Verification email resent for: ${resendDto.email}`);
      return {
        success: result.success,
        message: result.message,
        email: resendDto.email,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Resend verification failed for ${resendDto.email}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // For security, always return success to prevent email enumeration
      return {
        success: true,
        message: 'If the email exists in our system, a verification email has been sent.',
        email: resendDto.email,
      };
    }
  }

  // =================== PASSWORD RESET ===================

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @UseRateLimit(RATE_LIMITS.FORGOT_PASSWORD)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends a password reset code to the specified email address if it exists in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password reset attempts',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Req() request: Request,
  ): Promise<ForgotPasswordResponseDto> {
    try {
      const ipAddress = this.extractIpAddress(request);

      this.logger.log(`Password reset request for email: ${forgotPasswordDto.email}`);

      const result = await this.forgotPasswordUseCase.execute(forgotPasswordDto, ipAddress);

      this.logger.log(`Password reset request processed for: ${forgotPasswordDto.email}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Password reset request failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      // For security, always return success to prevent email enumeration
      return {
        success: true,
        email: forgotPasswordDto.email,
        message: 'If the email exists in our system, password reset instructions have been sent.',
        expiresInMinutes: 15,
      };
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Public()
  @SkipCSRF()
  @ApiOperation({
    summary: 'Reset password with verification code',
    description:
      'Resets user password using the verification code sent via email during forgot password process.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired reset code',
  })
  @ApiResponse({
    status: 401,
    description: 'Reset code verification failed',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() request: Request,
  ): Promise<ResetPasswordResponseDto> {
    try {
      const ipAddress = this.extractIpAddress(request);

      this.logger.log(`Password reset attempt for email: ${resetPasswordDto.email}`);

      const result = await this.resetPasswordUseCase.execute(resetPasswordDto, ipAddress);

      this.logger.log(`Password reset successfully for user: ${result.userId}`);
      return result;
    } catch (error: unknown) {
      this.logger.error(
        `Password reset failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      this.handleAuthError(error);
    }
  }
}
