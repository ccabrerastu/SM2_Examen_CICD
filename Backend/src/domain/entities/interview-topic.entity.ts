import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { InterviewQuestion } from './interview-question.entity';

export enum TopicCategory {
  PROGRAMMING_LANGUAGE = 'programming_language',
  INFRASTRUCTURE = 'infrastructure',
  DATABASE = 'database',
  FRAMEWORK = 'framework',
  SOFT_SKILLS = 'soft_skills',
  PROJECT_MANAGEMENT = 'project_management',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('interview_topics')
export class InterviewTopic {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name!: string; // e.g., "JavaScript", "Python", "PostgreSQL"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TopicCategory,
    default: TopicCategory.PROGRAMMING_LANGUAGE,
  })
  category!: TopicCategory;

  @Column({
    type: 'enum',
    enum: DifficultyLevel,
    default: DifficultyLevel.INTERMEDIATE,
  })
  difficulty!: DifficultyLevel;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, nullable: true })
  iconUrl?: string; // URL to topic icon/image

  @Column({ name: 'icon_name', type: 'varchar', length: 50, nullable: true })
  iconName?: string; // Icon name for frontend (e.g., 'javascript', 'python')

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number; // Display order in the list

  @Column({ name: 'estimated_duration_minutes', type: 'int', default: 5 })
  estimatedDurationMinutes!: number; // Estimated interview duration

  @OneToMany(() => InterviewQuestion, question => question.topic, { cascade: true })
  questions!: InterviewQuestion[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Business methods
  getTotalQuestions(): number {
    return this.questions?.length || 0;
  }

  getQuestionsByCategory(category: string): InterviewQuestion[] {
    if (!this.questions) return [];
    return this.questions.filter(q => q.category === category);
  }

  static createTopic(
    name: string,
    category: TopicCategory,
    difficulty: DifficultyLevel,
    description?: string,
    iconName?: string,
  ): InterviewTopic {
    const topic = new InterviewTopic();
    topic.name = name;
    topic.category = category;
    topic.difficulty = difficulty;
    if (description !== undefined) {
      topic.description = description;
    }
    if (iconName !== undefined) {
      topic.iconName = iconName;
    }
    topic.isActive = true;
    topic.order = 0;
    topic.estimatedDurationMinutes = 5;
    return topic;
  }
}
