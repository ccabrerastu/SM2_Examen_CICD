import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../interfaces/repositories/user-repository.interface';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { UpdateUserDto } from '../dtos/user/update-user.dto';
import { UserResponseDto } from '../dtos/user/user-response.dto';
import { PersonResponseDto } from '../dtos/person/person-response.dto';
import { User } from '../../domain/entities/user.entity';
import { HashingService } from '../../shared/services/hashing.service';
import {
  UserNotFoundError,
  UserAlreadyExistsError,
  InvalidCredentialsError,
  UserInactiveError,
} from '../../domain/errors/domain.errors';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly hashingService: HashingService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUserByEmail = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUserByEmail) {
      throw new UserAlreadyExistsError(createUserDto.email, 'email');
    }

    const hashedPassword = await this.hashingService.hash(createUserDto.password);

    const userToCreate = {
      ...createUserDto,
      password: hashedPassword,
    };

    const user = await this.userRepository.create(userToCreate);
    return this.mapToResponseDto(user);
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByIdWithPerson(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    return this.mapToResponseDto(user);
  }

  async getUserByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmailWithPerson(email);
    if (!user) {
      throw new UserNotFoundError(`with email ${email}`);
    }

    return this.mapToResponseDto(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByIdWithPerson(id);
    if (!existingUser) {
      throw new UserNotFoundError(id);
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new UserAlreadyExistsError(updateUserDto.email, 'email');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new UserNotFoundError(id);
    }

    return this.mapToResponseDto(updatedUser);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    const hashedPassword = await this.hashingService.hash(newPassword);
    const updated = await this.userRepository.updatePassword(id, hashedPassword);

    if (!updated) {
      throw new UserNotFoundError(id);
    }
  }

  async validateUserCredentials(identifier: string, password: string): Promise<UserResponseDto> {
    let user: User | null = null;

    if (identifier.includes('@')) {
      user = await this.userRepository.findByEmailWithPerson(identifier);
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      throw new UserInactiveError();
    }

    const userWithPassword = await this.userRepository.findById(user.id);
    if (!userWithPassword) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await this.hashingService.compare(password, userWithPassword.password);
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    await this.userRepository.updateLastLoginAt(user.id);

    return this.mapToResponseDto(user);
  }

  async updateLastLoginAt(id: string): Promise<void> {
    const updated = await this.userRepository.updateLastLoginAt(id);
    if (!updated) {
      throw new UserNotFoundError(id);
    }
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    const updated = await this.userRepository.updateRefreshToken(id, refreshToken);
    if (!updated) {
      throw new UserNotFoundError(id);
    }
  }

  async verifyEmail(id: string): Promise<void> {
    const updated = await this.userRepository.updateEmailVerificationStatus(id, true);
    if (!updated) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.clearEmailVerificationToken(id);
  }

  async generatePasswordResetToken(id: string): Promise<string> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    const token = this.hashingService.generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const updated = await this.userRepository.setPasswordResetToken(id, token, expiresAt);
    if (!updated) {
      throw new UserNotFoundError(id);
    }

    return token;
  }

  async generateEmailVerificationToken(id: string): Promise<string> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    const token = this.hashingService.generateSecureToken(32);
    const updated = await this.userRepository.setEmailVerificationToken(id, token);
    if (!updated) {
      throw new UserNotFoundError(id);
    }

    return token;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new UserNotFoundError(id);
    }
  }

  private mapToResponseDto(user: User): UserResponseDto {
    const personDto: PersonResponseDto = {
      id: user.person.id,
      fullName: user.person.fullName,
      createdAt: user.person.createdAt,
      updatedAt: user.person.updatedAt,
    };

    return {
      id: user.id,
      email: user.email,
      authProvider: user.authProvider,
      providerUserId: user.providerUserId,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      person: personDto,
    };
  }
}
