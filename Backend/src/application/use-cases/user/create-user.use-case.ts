import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '@/application/dtos/user/create-user.dto';
import { UserResponseDto } from '@/application/dtos/user/user-response.dto';
import { UserService } from '@/application/implementations/user.service';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    this.validateBusinessRules(createUserDto);

    return await this.userService.createUser(createUserDto);
  }

  private validateBusinessRules(createUserDto: CreateUserDto): void {
    this.validateEmail(createUserDto.email);
    this.validatePassword(createUserDto.password);
    this.validateAuthProvider(createUserDto);
    this.validatePersonData(createUserDto);
    this.validateRole(createUserDto.role);
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

  private validateAuthProvider(createUserDto: CreateUserDto): void {
    const { authProvider, providerUserId } = createUserDto;

    if (authProvider && authProvider !== 'EMAIL_PASSWORD') {
      if (!providerUserId || providerUserId.trim().length === 0) {
        throw new Error(`Provider user ID is required for ${authProvider} authentication`);
      }

      if (providerUserId.length > 255) {
        throw new Error('Provider user ID must not exceed 255 characters');
      }
    }

    if (authProvider === 'GOOGLE' && providerUserId) {
      if (!providerUserId.match(/^\d+$/)) {
        throw new Error('Google provider user ID must be numeric');
      }
    }

    if (authProvider === 'APPLE' && providerUserId) {
      if (providerUserId.length < 10) {
        throw new Error('Apple provider user ID must be at least 10 characters long');
      }
    }
  }

  private validatePersonData(createUserDto: CreateUserDto): void {
    const { person } = createUserDto;

    if (person.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }
  }

  private validateRole(role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN'): void {
    if (role && role === 'SUPER_ADMIN') {
      throw new Error('Cannot directly create a super admin user');
    }
  }
}
