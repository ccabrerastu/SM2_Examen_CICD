import { RefreshToken } from '../../../domain/entities/refresh-token.entity';

export interface IRefreshTokenRepository {
  save(refreshToken: RefreshToken): Promise<RefreshToken>;
  findById(id: string): Promise<RefreshToken | null>;
  findByTokenHash(tokenHash: string): Promise<RefreshToken | null>;
  findByJti(jti: string): Promise<RefreshToken | null>;
  findByUserId(userId: string): Promise<RefreshToken[]>;
  findByFamilyId(familyId: string): Promise<RefreshToken[]>;
  update(refreshToken: RefreshToken): Promise<RefreshToken>;
  delete(id: string): Promise<void>;
  revokeByUserId(userId: string, reason?: string): Promise<void>;
  revokeByFamilyId(familyId: string, reason?: string): Promise<void>;
  revokeToken(id: string, reason?: string, replacedBy?: string): Promise<void>;
  revokeExpiredTokens(): Promise<void>;
  findValidByUserId(userId: string): Promise<RefreshToken[]>;
  findValidByFamilyId(familyId: string): Promise<RefreshToken[]>;
}
