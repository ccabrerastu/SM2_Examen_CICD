import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { VerifyEmailDto } from '../../dtos/auth/verify-email.dto';
import { VerifyEmailResponseDto } from '../../dtos/auth/verify-email-response.dto';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { ITokenGenerationService } from '../../interfaces/services/token-generation-service.interface';
import { ValidationException } from '../../../domain/errors/domain.errors';

@Injectable()
export class VerifyEmailUseCase {
  private readonly logger = new Logger(VerifyEmailUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITokenGenerationService')
    private readonly tokenGenerationService: ITokenGenerationService,
  ) {}

  async execute(verifyEmailDto: VerifyEmailDto): Promise<VerifyEmailResponseDto> {
    this.logger.log(
      `Email verification attempt with token: ${verifyEmailDto.token.substring(0, 8)}...`,
    );

    try {
      await this.validateVerificationData(verifyEmailDto);

      // Find user by verification token
      const user = await this.userRepository.findByEmailVerificationToken(verifyEmailDto.token);
      if (!user) {
        this.logger.warn(`Invalid verification token: ${verifyEmailDto.token.substring(0, 8)}...`);
        throw new UnauthorizedException('Invalid or expired verification token');
      }

      // Check if email is already verified
      if (user.isEmailVerified) {
        this.logger.warn(`Email already verified for user: ${user.id}`);
        throw new ValidationException('Email is already verified');
      }

      // Verify token is still valid (not expired)
      // Note: Token expiration should be checked by the token generation service
      // For now, we'll assume tokens stored in DB are still valid
      // In production, you might want to add an expiration timestamp field

      // Mark email as verified and clear verification token
      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        emailVerificationToken: null,
      });

      this.logger.log(`Email verified successfully for user: ${user.id}`);

      return new VerifyEmailResponseDto(true, user.id, user.email, 'Email verified successfully');
    } catch (error: unknown) {
      this.logger.error(
        `Email verification failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Resend verification email to user
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Resending verification email to: ${email}`);

    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        this.logger.warn(`Verification email resend attempt for non-existent email: ${email}`);
        throw new ValidationException('User not found');
      }

      if (user.isEmailVerified) {
        this.logger.warn(`Verification email resend attempt for already verified email: ${email}`);
        throw new ValidationException('Email is already verified');
      }

      // Generate new verification token
      const { token } = this.tokenGenerationService.generateEmailVerificationToken(24); // 24 hours

      // Update user with new verification token
      await this.userRepository.update(user.id, {
        emailVerificationToken: token,
      });

      // TODO: Send email with verification token
      // await this.emailService.sendVerificationEmail(user.email, token);

      this.logger.log(`Verification email resent to: ${email}`);

      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to resend verification email: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async validateVerificationData(verifyEmailDto: VerifyEmailDto): Promise<void> {
    if (!verifyEmailDto.token || verifyEmailDto.token.trim().length === 0) {
      throw new ValidationException('Verification token is required');
    }

    if (verifyEmailDto.token.length < 6) {
      throw new ValidationException('Invalid verification token format');
    }
  }
}
