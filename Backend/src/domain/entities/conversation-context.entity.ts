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
import { InterviewSession } from './interview-session.entity';

export enum ContextType {
  CONVERSATION_HISTORY = 'conversation_history',
  USER_PROFILE = 'user_profile',
  SESSION_STATE = 'session_state',
  DOMAIN_KNOWLEDGE = 'domain_knowledge',
  PREFERENCES = 'preferences',
}

export enum ContextStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
}

@Entity('conversation_contexts')
@Index(['sessionId', 'contextType'])
@Index(['contextKey'])
@Index(['status'])
@Index(['priority'])
export class ConversationContext {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  @Index()
  sessionId!: string;

  @ManyToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: InterviewSession;

  @Column({
    name: 'context_type',
    type: 'enum',
    enum: ContextType,
  })
  @Index()
  contextType!: ContextType;

  @Column({ name: 'context_key', type: 'varchar', length: 255 })
  @Index()
  contextKey!: string;

  @Column({ name: 'context_value', type: 'jsonb' })
  contextValue!: Record<string, unknown>;

  @Column({ name: 'priority', type: 'int', default: 1 })
  @Index()
  priority!: number; // 1 = highest priority, 10 = lowest

  @Column({
    name: 'status',
    type: 'enum',
    enum: ContextStatus,
    default: ContextStatus.ACTIVE,
  })
  @Index()
  status!: ContextStatus;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ name: 'access_count', type: 'int', default: 0 })
  accessCount!: number;

  @Column({ name: 'last_accessed_at', type: 'timestamp', nullable: true })
  lastAccessedAt?: Date;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    source?: string;
    confidence?: number;
    tags?: string[];
    relevanceScore?: number;
    updateStrategy?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Methods
  access(): void {
    this.accessCount++;
    this.lastAccessedAt = new Date();
  }

  updateValue(newValue: Record<string, unknown>): void {
    this.contextValue = newValue;
  }

  mergeValue(newValue: Record<string, unknown>): void {
    if (typeof this.contextValue === 'object' && typeof newValue === 'object') {
      this.contextValue = { ...this.contextValue, ...newValue };
    } else {
      this.contextValue = newValue;
    }
  }

  archive(): void {
    this.status = ContextStatus.ARCHIVED;
  }

  get isActive(): boolean {
    return this.status === ContextStatus.ACTIVE && (!this.expiresAt || this.expiresAt > new Date());
  }

  get isExpired(): boolean {
    return !!this.expiresAt && this.expiresAt <= new Date();
  }
}

@Entity('conversation_summaries')
@Index(['sessionId'])
@Index(['summaryType'])
export class ConversationSummary {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'session_id', type: 'uuid' })
  @Index()
  sessionId!: string;

  @ManyToOne(() => InterviewSession, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: InterviewSession;

  @Column({ name: 'summary_type', type: 'varchar', length: 100 })
  @Index()
  summaryType!: string; // 'topic_summary', 'key_points', 'sentiment_analysis', 'progress_summary'

  @Column({ name: 'summary_content', type: 'jsonb' })
  summaryContent!: {
    summary?: string;
    keyPoints?: string[];
    topics?: string[];
    sentiment?: string;
    metrics?: Record<string, number | string>;
    insights?: Record<string, unknown>;
  };

  @Column({ name: 'message_range_start', type: 'int' })
  messageRangeStart!: number;

  @Column({ name: 'message_range_end', type: 'int' })
  messageRangeEnd!: number;

  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidenceScore?: number;

  @Column({ name: 'generated_by', type: 'varchar', length: 100, nullable: true })
  generatedBy?: string; // 'ai_model', 'rule_based', 'hybrid'

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    model?: string;
    version?: string;
    processingTime?: number;
    tokens?: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('context_relationships')
@Index(['parentContextId', 'childContextId'])
@Index(['relationshipType'])
export class ContextRelationship {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parent_context_id', type: 'uuid' })
  @Index()
  parentContextId!: string;

  @ManyToOne(() => ConversationContext, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_context_id' })
  parentContext!: ConversationContext;

  @Column({ name: 'child_context_id', type: 'uuid' })
  @Index()
  childContextId!: string;

  @ManyToOne(() => ConversationContext, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_context_id' })
  childContext!: ConversationContext;

  @Column({ name: 'relationship_type', type: 'varchar', length: 100 })
  @Index()
  relationshipType!: string; // 'depends_on', 'contradicts', 'supports', 'extends'

  @Column({ name: 'strength', type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  strength!: number; // 0.0 to 1.0

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    reason?: string;
    confidence?: number;
    source?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
