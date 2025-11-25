import { Injectable, Inject, Logger } from '@nestjs/common';
import { ForgotPasswordDto } from '../../dtos/auth/forgot-password.dto';
import { ForgotPasswordResponseDto } from '../../dtos/auth/forgot-password-response.dto';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { ITokenGenerationService } from '../../interfaces/services/token-generation-service.interface';
import { IHashService } from '../../interfaces/services/hash-service.interface';
import { ValidationException } from '../../../domain/errors/domain.errors';

@Injectable()
export class ForgotPasswordUseCase {
  private readonly logger = new Logger(ForgotPasswordUseCase.name);
  private readonly RESET_TOKEN_EXPIRY_MINUTES = 15;

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITokenGenerationService')
    private readonly tokenGenerationService: ITokenGenerationService,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(
    forgotPasswordDto: ForgotPasswordDto,
    _ipAddress?: string,
  ): Promise<ForgotPasswordResponseDto> {
    this.logger.log(`Password reset request for email: ${forgotPasswordDto.email}`);

    try {
      await this.validateForgotPasswordData(forgotPasswordDto);

      const user = await this.userRepository.findByEmail(forgotPasswordDto.email);

      // For security reasons, we don't reveal if email exists or not
      // Always return success response to prevent email enumeration
      if (!user) {
        this.logger.warn(
          `Password reset request for non-existent email: ${forgotPasswordDto.email}`,
        );
        return this.createSuccessResponse(forgotPasswordDto.email);
      }

      // Check if user is using email/password authentication
      if (user.authProvider !== 'EMAIL_PASSWORD') {
        this.logger.warn(`Password reset request for ${user.authProvider} user: ${user.id}`);
        return this.createSuccessResponse(forgotPasswordDto.email);
      }

      // Check if user account is active
      if (!user.isActive) {
        this.logger.warn(`Password reset request for inactive user: ${user.id}`);
        return this.createSuccessResponse(forgotPasswordDto.email);
      }

      // Rate limiting check - prevent too frequent requests
      await this.checkRateLimit(user.id);

      // Generate secure password reset token
      const resetToken = this.tokenGenerationService.generateNumericOTP(6); // 6-digit code
      const resetTokenExpires = new Date(Date.now() + this.RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Hash the reset token before storing
      const hashedResetToken = await this.hashService.hash(resetToken);

      // Update user with reset token and expiration
      await this.userRepository.update(user.id, {
        passwordResetToken: hashedResetToken,
        passwordResetTokenExpires: resetTokenExpires,
      });

      this.logger.log(`Password reset token generated for user: ${user.id}`);

      // TODO: Send password reset email with the token
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      return this.createSuccessResponse(forgotPasswordDto.email);
    } catch (error: unknown) {
      this.logger.error(
        `Password reset request failed for email: ${forgotPasswordDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );

      // For security, don't reveal internal errors
      return this.createSuccessResponse(forgotPasswordDto.email);
    }
  }

  /**
   * Verify if password reset token is valid
   */
  async verifyResetToken(
    email: string,
    token: string,
  ): Promise<{ isValid: boolean; userId?: string }> {
    this.logger.debug(`Verifying reset token for email: ${email}`);

    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user || !user.passwordResetToken || !user.passwordResetTokenExpires) {
        this.logger.debug(`No valid reset token found for email: ${email}`);
        return { isValid: false };
      }

      // Check if token has expired
      if (new Date() > user.passwordResetTokenExpires) {
        this.logger.debug(`Reset token expired for user: ${user.id}`);
        // Clear expired token
        await this.userRepository.update(user.id, {
          passwordResetToken: null,
          passwordResetTokenExpires: null,
        });
        return { isValid: false };
      }

      // Verify the token
      const isValidToken = await this.hashService.compare(token, user.passwordResetToken);
      if (!isValidToken) {
        this.logger.debug(`Invalid reset token for user: ${user.id}`);
        return { isValid: false };
      }

      return { isValid: true, userId: user.id };
    } catch (error: unknown) {
      this.logger.error(
        `Error verifying reset token: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return { isValid: false };
    }
  }

  private async validateForgotPasswordData(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    if (!forgotPasswordDto.email || forgotPasswordDto.email.trim().length === 0) {
      throw new ValidationException('Email is required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordDto.email)) {
      throw new ValidationException('Invalid email format');
    }
  }

  private async checkRateLimit(userId: string): Promise<void> {
    // Check if user has recently requested a password reset
    const user = await this.userRepository.findById(userId);
    if (user?.passwordResetTokenExpires) {
      const timeSinceLastRequest =
        Date.now() -
        (user.passwordResetTokenExpires.getTime() - this.RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);
      const minIntervalMs = 60 * 1000; // 1 minute minimum between requests

      if (timeSinceLastRequest < minIntervalMs) {
        this.logger.warn(`Rate limit exceeded for password reset: ${userId}`);
        throw new ValidationException('Please wait before requesting another password reset');
      }
    }
  }

  private createSuccessResponse(email: string): ForgotPasswordResponseDto {
    return new ForgotPasswordResponseDto(
      true,
      email,
      'If the email exists in our system, password reset instructions have been sent.',
      this.RESET_TOKEN_EXPIRY_MINUTES,
    );
  }
}
