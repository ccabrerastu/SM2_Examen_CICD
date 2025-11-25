import { Injectable } from '@nestjs/common';
import { UserService } from '../../implementations/user.service';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { UserResponseDto } from '../../dtos/user/user-response.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    this.validateId(id);
    this.validateBusinessRules(updateUserDto);

    return await this.userService.updateUser(id, updateUserDto);
  }

  async executeUpdatePassword(id: string, newPassword: string): Promise<void> {
    this.validateId(id);
    this.validatePassword(newPassword);

    return await this.userService.updatePassword(id, newPassword);
  }

  async executeVerifyEmail(id: string): Promise<void> {
    this.validateId(id);

    return await this.userService.verifyEmail(id);
  }

  async executeUpdateLastLogin(id: string): Promise<void> {
    this.validateId(id);

    return await this.userService.updateLastLoginAt(id);
  }

  async executeGeneratePasswordResetToken(id: string): Promise<string> {
    this.validateId(id);

    return await this.userService.generatePasswordResetToken(id);
  }

  async executeGenerateEmailVerificationToken(id: string): Promise<string> {
    this.validateId(id);

    return await this.userService.generateEmailVerificationToken(id);
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for user ID');
    }
  }

  private validateBusinessRules(updateUserDto: UpdateUserDto): void {
    if (updateUserDto.email !== undefined) {
      this.validateEmail(updateUserDto.email);
    }

    if (updateUserDto.role !== undefined) {
      this.validateRole(updateUserDto.role);
    }

    if (updateUserDto.person !== undefined) {
      this.validatePersonData(updateUserDto.person);
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    const forbiddenDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    if (forbiddenDomains.includes(domain.toLowerCase())) {
      throw new Error('Email from temporary email services are not allowed');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }

    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);

    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!hasNumbers) {
      throw new Error('Password must contain at least one number');
    }

    if (!hasSpecialChar) {
      throw new Error('Password must contain at least one special character (@$!%*?&)');
    }

    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      throw new Error('This password is too common, please choose a stronger one');
    }
  }

  private validateRole(role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'): void {
    const validRoles: ('STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN')[] = [
      'STUDENT',
      'TEACHER',
      'ADMIN',
      'SUPER_ADMIN',
    ];

    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  private validatePersonData(
    person: import('../../dtos/person/update-person.dto').UpdatePersonDto,
  ): void {
    if (person.fullName !== undefined) {
      if (person.fullName.trim().length < 2) {
        throw new Error('Full name must be at least 2 characters long');
      }
      if (person.fullName.trim().length > 100) {
        throw new Error('Full name must not exceed 100 characters');
      }
    }
  }
}
