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
import { Chapter } from './chapter.entity';

export enum VocabularyItemType {
  WORD = 'word',
  PHRASE = 'phrase',
  EXPRESSION = 'expression',
}

export enum VocabularyDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('vocabulary_items')
@Index(['chapterId'])
@Index(['type', 'difficulty'])
@Index(['englishTerm'])
export class VocabularyItem {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  chapterId!: string;

  @Column({ type: 'varchar', length: 255 })
  englishTerm!: string;

  @Column({ type: 'varchar', length: 255 })
  spanishTranslation!: string;

  @Column({
    type: 'enum',
    enum: VocabularyItemType,
    default: VocabularyItemType.WORD,
  })
  type!: VocabularyItemType;

  @Column({
    type: 'enum',
    enum: VocabularyDifficulty,
    default: VocabularyDifficulty.EASY,
  })
  difficulty!: VocabularyDifficulty;

  @Column({ type: 'text', nullable: true })
  definition!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  exampleSentence!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  exampleTranslation!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pronunciation!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioUrl!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @ManyToOne(() => Chapter, chapter => chapter.vocabularyItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chapterId' })
  chapter!: Chapter;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  getDisplayType(): string {
    const typeNames = {
      [VocabularyItemType.WORD]: 'Word',
      [VocabularyItemType.PHRASE]: 'Phrase',
      [VocabularyItemType.EXPRESSION]: 'Expression',
    };
    return typeNames[this.type];
  }

  getDifficultyLevel(): string {
    const difficultyNames = {
      [VocabularyDifficulty.EASY]: 'Easy',
      [VocabularyDifficulty.MEDIUM]: 'Medium',
      [VocabularyDifficulty.HARD]: 'Hard',
    };
    return difficultyNames[this.difficulty];
  }

  hasAudio(): boolean {
    return !!this.audioUrl;
  }

  hasImage(): boolean {
    return !!this.imageUrl;
  }

  hasExample(): boolean {
    return !!this.exampleSentence;
  }
}
