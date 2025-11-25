import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Person } from './person.entity';
import { RefreshToken } from './refresh-token.entity';

@Entity('users')
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: ['EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'FACEBOOK'],
    default: 'EMAIL_PASSWORD',
  })
  authProvider!: 'EMAIL_PASSWORD' | 'GOOGLE' | 'APPLE' | 'FACEBOOK';

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerUserId!: string | null;

  @Column({
    type: 'enum',
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'STUDENT',
  })
  role!: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  passwordResetTokenExpires!: Date | null;

  @Column({ type: 'uuid' })
  personId!: string;

  @OneToOne(() => Person, { cascade: true, eager: false })
  @JoinColumn({ name: 'personId' })
  person!: Person;

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user, {
    cascade: true,
  })
  refreshTokens!: RefreshToken[];

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  get isGoogleAuth(): boolean {
    return this.authProvider === 'GOOGLE';
  }

  get isAppleAuth(): boolean {
    return this.authProvider === 'APPLE';
  }

  get isEmailPasswordAuth(): boolean {
    return this.authProvider === 'EMAIL_PASSWORD';
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN' || this.role === 'SUPER_ADMIN';
  }

  get isSuperAdmin(): boolean {
    return this.role === 'SUPER_ADMIN';
  }
}
