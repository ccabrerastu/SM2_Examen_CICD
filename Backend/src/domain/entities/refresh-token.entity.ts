import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('refresh_tokens')
@Index(['tokenHash'], { unique: true })
@Index(['userId'])
@Index(['familyId'])
@Index(['jti'], { unique: true })
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 500, unique: true, name: 'token_hash' })
  tokenHash!: string;

  @Column({ type: 'uuid', name: 'family_id' })
  familyId!: string;

  @Column({ type: 'uuid', unique: true })
  jti!: string;

  @Column({ type: 'uuid', nullable: true, name: 'replaced_by' })
  replacedBy!: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'revoked_at' })
  revokedAt!: Date | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  reason!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'device_info' })
  deviceInfo!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true, name: 'ip_hash' })
  ipHash!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'user_agent' })
  userAgent!: string | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  readonly updatedAt!: Date;

  // Business logic methods
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }
}
