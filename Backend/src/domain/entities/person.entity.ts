import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('persons')
export class Person {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'varchar', length: 100 })
  fullName!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;
}
