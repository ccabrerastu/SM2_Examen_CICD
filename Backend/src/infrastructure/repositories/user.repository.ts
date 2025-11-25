import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Person } from '../../domain/entities/person.entity';
import { IUserRepository } from '../../application/interfaces/repositories/user-repository.interface';
import { CreateUserDto } from '../../application/dtos/user/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/user/update-user.dto';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, {
        email: createUserDto.email,
        password: createUserDto.password,
        authProvider: createUserDto.authProvider || 'EMAIL_PASSWORD',
        providerUserId: createUserDto.providerUserId || null,
        role: createUserDto.role || 'STUDENT',
        personId: createUserDto.personId,
      });
      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return (await this.findByIdWithPerson(savedUser.id)) as User;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByIdWithPerson(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['person'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPerson(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      relations: ['person'],
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'role',
        'isActive',
        'authProvider',
        'isEmailVerified',
        'createdAt',
        'updatedAt',
      ],
      relations: ['person'],
    });
  }

  async findByEmailVerificationToken(token: string): Promise<User | null> {
    return await this.repository.findOne({ where: { emailVerificationToken: token } });
  }

  async findAll(page: number, limit: number): Promise<[User[], number]> {
    return await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findByIdWithPerson(id);
      if (!user) {
        await queryRunner.rollbackTransaction();
        return null;
      }

      if (updateUserDto.person) {
        const updatePersonData: Partial<Person> = {
          ...updateUserDto.person,
        };

        await queryRunner.manager.update(Person, user.personId, updatePersonData);
      }

      const updateUserData: Partial<User> = {};
      if (updateUserDto.email) updateUserData.email = updateUserDto.email;
      if (updateUserDto.role) updateUserData.role = updateUserDto.role;
      if (updateUserDto.passwordResetToken !== undefined)
        updateUserData.passwordResetToken = updateUserDto.passwordResetToken;
      if (updateUserDto.passwordResetTokenExpires !== undefined)
        updateUserData.passwordResetTokenExpires = updateUserDto.passwordResetTokenExpires;
      if (updateUserDto.emailVerificationToken !== undefined)
        updateUserData.emailVerificationToken = updateUserDto.emailVerificationToken;
      if (updateUserDto.isEmailVerified !== undefined)
        updateUserData.isEmailVerified = updateUserDto.isEmailVerified;
      if (updateUserDto.lastLoginAt !== undefined)
        updateUserData.lastLoginAt = updateUserDto.lastLoginAt;

      if (Object.keys(updateUserData).length > 0) {
        await queryRunner.manager.update(User, id, updateUserData);
      }

      await queryRunner.commitTransaction();
      return await this.findByIdWithPerson(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const result = await this.repository.update(id, { password: hashedPassword });
    return result.affected !== 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateRefreshToken(_id: string, _refreshToken: string | null): Promise<boolean> {
    // Note: Refresh tokens are managed through RefreshToken entity, not directly on User
    // This method signature exists for interface compliance but should be implemented
    // differently or the interface should be updated
    throw new Error(
      'updateRefreshToken should be implemented through RefreshToken entity management',
    );
  }

  async updateLastLoginAt(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { lastLoginAt: new Date() });
    return result.affected !== 0;
  }

  async updateEmailVerificationStatus(id: string, isVerified: boolean): Promise<boolean> {
    const result = await this.repository.update(id, { isEmailVerified: isVerified });
    return result.affected !== 0;
  }

  async setPasswordResetToken(id: string, token: string, expiresAt: Date): Promise<boolean> {
    const result = await this.repository.update(id, {
      passwordResetToken: token,
      passwordResetTokenExpires: expiresAt,
    });
    return result.affected !== 0;
  }

  async clearPasswordResetToken(id: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      passwordResetToken: null,
      passwordResetTokenExpires: null,
    });
    return result.affected !== 0;
  }

  async setEmailVerificationToken(id: string, token: string): Promise<boolean> {
    const result = await this.repository.update(id, { emailVerificationToken: token });
    return result.affected !== 0;
  }

  async clearEmailVerificationToken(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { emailVerificationToken: null });
    return result.affected !== 0;
  }

  async delete(id: string): Promise<boolean> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.findById(id);
      if (!user) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      await queryRunner.manager.delete(User, id);
      await queryRunner.manager.delete(Person, user.personId);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
