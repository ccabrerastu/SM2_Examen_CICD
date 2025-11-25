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

@Entity('daily_lives')
@Index(['userId'], { unique: false })
@Index(['userId', 'lastResetDate'], { unique: true })
export class DailyLives {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'int', default: 5 })
  currentLives!: number;

  @Column({ type: 'date' })
  lastResetDate!: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  get hasLivesAvailable(): boolean {
    return this.currentLives > 0;
  }

  get needsReset(): boolean {
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate =
      this.lastResetDate instanceof Date ? this.lastResetDate : new Date(this.lastResetDate);
    const lastReset = lastResetDate.toISOString().split('T')[0];
    return today !== lastReset;
  }

  resetLives(): void {
    this.currentLives = 5;
    this.lastResetDate = new Date();
  }

  consumeLife(): boolean {
    if (this.currentLives > 0) {
      this.currentLives--;
      return true;
    }
    return false;
  }
}
