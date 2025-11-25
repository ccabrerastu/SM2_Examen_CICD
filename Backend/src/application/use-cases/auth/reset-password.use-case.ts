import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ResetPasswordDto } from '../../dtos/auth/reset-password.dto';
import { ResetPasswordResponseDto } from '../../dtos/auth/reset-password-response.dto';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IRefreshTokenRotationService } from '../../interfaces/services/refresh-token-rotation-service.interface';
import { IHashService } from '../../interfaces/services/hash-service.interface';
import { ValidationException } from '../../../domain/errors/domain.errors';

@Injectable()
export class ResetPasswordUseCase {
  private readonly logger = new Logger(ResetPasswordUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRotationService')
    private readonly refreshTokenRotationService: IRefreshTokenRotationService,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(
    resetPasswordDto: ResetPasswordDto,
    _ipAddress?: string,
  ): Promise<ResetPasswordResponseDto> {
    this.logger.log(`Password reset attempt for email: ${resetPasswordDto.email}`);

    try {
      await this.validateResetPasswordData(resetPasswordDto);

      const user = await this.userRepository.findByEmail(resetPasswordDto.email);
      if (!user) {
        this.logger.warn(
          `Password reset attempt for non-existent email: ${resetPasswordDto.email}`,
        );
        throw new UnauthorizedException('Invalid reset code or email');
      }

      // Check if user has a valid reset token
      if (!user.passwordResetToken || !user.passwordResetTokenExpires) {
        this.logger.warn(`Password reset attempt without valid token for user: ${user.id}`);
        throw new UnauthorizedException('Invalid reset code or email');
      }

      // Check if reset token has expired
      if (new Date() > user.passwordResetTokenExpires) {
        this.logger.warn(`Password reset attempt with expired token for user: ${user.id}`);

        // Clear expired token
        await this.userRepository.update(user.id, {
          passwordResetToken: null,
          passwordResetTokenExpires: null,
        });

        throw new UnauthorizedException('Reset code has expired');
      }

      // Verify the reset code
      const isValidCode = await this.hashService.compare(
        resetPasswordDto.code,
        user.passwordResetToken,
      );
      if (!isValidCode) {
        this.logger.warn(`Invalid reset code for user: ${user.id}`);
        throw new UnauthorizedException('Invalid reset code or email');
      }

      // Check if user is using email/password authentication
      if (user.authProvider !== 'EMAIL_PASSWORD') {
        this.logger.warn(`Password reset attempt for ${user.authProvider} user: ${user.id}`);
        throw new ValidationException(`Cannot reset password for ${user.authProvider} account`);
      }

      // Check if user account is active
      if (!user.isActive) {
        this.logger.warn(`Password reset attempt for inactive user: ${user.id}`);
        throw new UnauthorizedException('Account is deactivated');
      }

      // Validate new password strength
      await this.validatePasswordStrength(resetPasswordDto.newPassword);

      // Check if new password is different from current password
      const isSamePassword = await this.hashService.compare(
        resetPasswordDto.newPassword,
        user.password,
      );
      if (isSamePassword) {
        this.logger.warn(`Password reset attempt with same password for user: ${user.id}`);
        throw new ValidationException('New password must be different from current password');
      }

      // Hash the new password with enhanced security
      const hashedNewPassword = await this.hashService.hash(resetPasswordDto.newPassword);

      // Update user password
      await this.userRepository.updatePassword(user.id, hashedNewPassword);

      // Clear reset token
      await this.userRepository.update(user.id, {
        passwordResetToken: null,
        passwordResetTokenExpires: null,
      });

      // Revoke all existing refresh tokens for security
      await this.revokeAllUserTokens(user.id, 'PASSWORD_RESET');

      this.logger.log(`Password reset successfully for user: ${user.id}`);

      // TODO: Send password reset confirmation email
      // await this.emailService.sendPasswordResetConfirmationEmail(user.email);

      return new ResetPasswordResponseDto(
        true,
        user.id,
        user.email,
        'Password reset successfully. Please login with your new password.',
      );
    } catch (error: unknown) {
      this.logger.error(
        `Password reset failed for email: ${resetPasswordDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async validateResetPasswordData(resetPasswordDto: ResetPasswordDto): Promise<void> {
    if (!resetPasswordDto.email || resetPasswordDto.email.trim().length === 0) {
      throw new ValidationException('Email is required');
    }

    if (!resetPasswordDto.code || resetPasswordDto.code.trim().length === 0) {
      throw new ValidationException('Reset code is required');
    }

    if (!resetPasswordDto.newPassword || resetPasswordDto.newPassword.trim().length === 0) {
      throw new ValidationException('New password is required');
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetPasswordDto.email)) {
      throw new ValidationException('Invalid email format');
    }
  }

  private async validatePasswordStrength(password: string): Promise<void> {
    if (password.length < 12) {
      throw new ValidationException('New password must be at least 12 characters long');
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      throw new ValidationException('New password must contain at least one lowercase letter');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      throw new ValidationException('New password must contain at least one uppercase letter');
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
      throw new ValidationException('New password must contain at least one number');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationException('New password must contain at least one special character');
    }

    // Check for common weak passwords
    const commonPasswords = [
      'password123',
      '123456789012',
      'qwerty123456',
      'admin123456',
      'password1234',
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
      throw new ValidationException('Password is too common. Please choose a stronger password');
    }
  }

  private async revokeAllUserTokens(userId: string, reason: string): Promise<void> {
    try {
      const revokedCount = await this.refreshTokenRotationService.revokeUserTokens(userId, reason);
      this.logger.log(`Revoked ${revokedCount} tokens for user ${userId} due to password reset`);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to revoke user tokens during password reset: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      // Don't throw error as password reset was successful
    }
  }
}
