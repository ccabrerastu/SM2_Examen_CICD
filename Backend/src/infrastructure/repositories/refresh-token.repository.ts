import { Injectable } from '@nestjs/common';
import { Repository, LessThan, IsNull, MoreThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../../application/interfaces/repositories/refresh-token-repository.interface';

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return await this.repository.save(refreshToken);
  }

  async findById(id: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({
      where: { tokenHash, revokedAt: IsNull() },
      relations: ['user'],
    });
  }

  async findByJti(jti: string): Promise<RefreshToken | null> {
    return await this.repository.findOne({
      where: { jti },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByFamilyId(familyId: string): Promise<RefreshToken[]> {
    return await this.repository.find({
      where: { familyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findValidByUserId(userId: string): Promise<RefreshToken[]> {
    return await this.repository.find({
      where: {
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findValidByFamilyId(familyId: string): Promise<RefreshToken[]> {
    return await this.repository.find({
      where: {
        familyId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(refreshToken: RefreshToken): Promise<RefreshToken> {
    await this.repository.save(refreshToken);
    return refreshToken;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async revokeToken(id: string, reason?: string, replacedBy?: string): Promise<void> {
    const updateData: Partial<{
      revokedAt: Date;
      reason: string;
      replacedBy: string;
    }> = {
      revokedAt: new Date(),
    };

    if (reason) {
      updateData.reason = reason;
    }

    if (replacedBy) {
      updateData.replacedBy = replacedBy;
    }

    await this.repository.update({ id }, updateData);
  }

  async revokeByUserId(userId: string, reason?: string): Promise<void> {
    const updateData: Partial<{
      revokedAt: Date;
      reason: string;
    }> = {
      revokedAt: new Date(),
    };

    if (reason) {
      updateData.reason = reason;
    }

    await this.repository.update({ userId, revokedAt: IsNull() }, updateData);
  }

  async revokeByFamilyId(familyId: string, reason?: string): Promise<void> {
    const updateData: Partial<{
      revokedAt: Date;
      reason: string;
    }> = {
      revokedAt: new Date(),
    };

    if (reason) {
      updateData.reason = reason;
    }

    await this.repository.update({ familyId, revokedAt: IsNull() }, updateData);
  }

  async revokeExpiredTokens(): Promise<void> {
    await this.repository.update(
      {
        expiresAt: LessThan(new Date()),
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
        reason: 'EXPIRED',
      },
    );
  }
}
