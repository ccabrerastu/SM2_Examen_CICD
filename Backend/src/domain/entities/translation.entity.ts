import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TranslationStatus {
  ACTIVE = 'active',
  CACHED = 'cached',
  EXPIRED = 'expired',
}

export enum TranslationSource {
  GOOGLE_TRANSLATE = 'google_translate',
  DEEPL = 'deepl',
  MANUAL = 'manual',
  VOCABULARY = 'vocabulary',
}

@Entity('translations')
@Index(['originalText', 'sourceLanguage', 'targetLanguage'])
@Index(['sourceLanguage', 'targetLanguage'])
@Index(['status'])
@Index(['source'])
@Index(['createdAt'])
export class Translation {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'text' })
  originalText!: string;

  @Column({ type: 'text' })
  translatedText!: string;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  sourceLanguage!: string;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  targetLanguage!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pronunciation!: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  examples!: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  audioUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  definition!: string | null;

  @Column({ type: 'text', nullable: true })
  context!: string | null;

  @Column({
    type: 'enum',
    enum: TranslationStatus,
    default: TranslationStatus.ACTIVE,
  })
  status!: TranslationStatus;

  @Column({
    type: 'enum',
    enum: TranslationSource,
    default: TranslationSource.GOOGLE_TRANSLATE,
  })
  source!: TranslationSource;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'integer', default: 0 })
  usageCount!: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return this.status === TranslationStatus.ACTIVE && !this.isExpired();
  }

  incrementUsage(): void {
    this.usageCount += 1;
    this.lastUsedAt = new Date();
  }

  getLanguagePair(): string {
    return `${this.sourceLanguage}-${this.targetLanguage}`;
  }

  hasAudio(): boolean {
    return !!this.audioUrl;
  }

  hasPronunciation(): boolean {
    return !!this.pronunciation;
  }

  hasExamples(): boolean {
    return this.examples && this.examples.length > 0;
  }

  hasDefinition(): boolean {
    return !!this.definition;
  }

  setExpiration(days: number = 30): void {
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + days);
  }

  markAsExpired(): void {
    this.status = TranslationStatus.EXPIRED;
  }

  toResponseFormat(): {
    id: string;
    originalText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    pronunciation: string | null;
    examples: string[];
    audioUrl: string | null;
    definition: string | null;
    context: string | null;
    createdAt: string;
    expiresAt: string | null;
  } {
    return {
      id: this.id,
      originalText: this.originalText,
      translatedText: this.translatedText,
      sourceLanguage: this.sourceLanguage,
      targetLanguage: this.targetLanguage,
      pronunciation: this.pronunciation,
      examples: this.examples,
      audioUrl: this.audioUrl,
      definition: this.definition,
      context: this.context,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt?.toISOString() || null,
    };
  }
}
