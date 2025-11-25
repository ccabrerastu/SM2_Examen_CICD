import { User } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../../dtos/user/create-user.dto';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByIdWithPerson(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPerson(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findByEmailVerificationToken(token: string): Promise<User | null>;
  findAll(page: number, limit: number): Promise<[User[], number]>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
  updatePassword(id: string, hashedPassword: string): Promise<boolean>;
  updateRefreshToken(id: string, refreshToken: string | null): Promise<boolean>;
  updateLastLoginAt(id: string): Promise<boolean>;
  updateEmailVerificationStatus(id: string, isVerified: boolean): Promise<boolean>;
  setPasswordResetToken(id: string, token: string, expiresAt: Date): Promise<boolean>;
  clearPasswordResetToken(id: string): Promise<boolean>;
  setEmailVerificationToken(id: string, token: string): Promise<boolean>;
  clearEmailVerificationToken(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string): Promise<boolean>;
}
