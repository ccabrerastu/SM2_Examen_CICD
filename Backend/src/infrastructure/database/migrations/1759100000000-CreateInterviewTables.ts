import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateInterviewTables1759100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create interview_topics table
    await queryRunner.createTable(
      new Table({
        name: 'interview_topics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'enum',
            enum: [
              'programming_language',
              'infrastructure',
              'database',
              'framework',
              'soft_skills',
              'project_management',
            ],
            default: "'programming_language'",
            isNullable: false,
          },
          {
            name: 'difficulty',
            type: 'enum',
            enum: ['beginner', 'intermediate', 'advanced'],
            default: "'intermediate'",
            isNullable: false,
          },
          {
            name: 'icon_url',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'icon_name',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'estimated_duration_minutes',
            type: 'int',
            default: 5,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index on name for faster lookups
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_topics_name" ON "interview_topics" ("name")`,
    );

    // Create index on category
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_topics_category" ON "interview_topics" ("category")`,
    );

    // Create interview_questions table
    await queryRunner.createTable(
      new Table({
        name: 'interview_questions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'topic_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'question',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'enum',
            enum: ['conceptual', 'experience', 'decision', 'behavioral'],
            default: "'conceptual'",
            isNullable: false,
          },
          {
            name: 'difficulty',
            type: 'enum',
            enum: ['easy', 'medium', 'hard'],
            default: "'medium'",
            isNullable: false,
          },
          {
            name: 'context',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sample_answers',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'keywords',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'evaluation_criteria',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'minimum_answer_length',
            type: 'int',
            default: 60,
            isNullable: false,
          },
          {
            name: 'recommended_time_seconds',
            type: 'int',
            default: 120,
            isNullable: false,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'hints',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign key from interview_questions to interview_topics
    await queryRunner.createForeignKey(
      'interview_questions',
      new TableForeignKey({
        columnNames: ['topic_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'interview_topics',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_questions_topic_id" ON "interview_questions" ("topic_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_interview_questions_category" ON "interview_questions" ("category")`,
    );

    // Create interview_sessions table
    await queryRunner.createTable(
      new Table({
        name: 'interview_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'topic_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['not_started', 'in_progress', 'completed', 'abandoned'],
            default: "'not_started'",
            isNullable: false,
          },
          {
            name: 'total_questions',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'questions_answered',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'current_question_index',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'answers',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'overall_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'fluency_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'grammar_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'vocabulary_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'pronunciation_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'coherence_score',
            type: 'numeric',
            precision: 5,
            scale: 2,
            default: 0,
            isNullable: false,
          },
          {
            name: 'final_feedback',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'strengths',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'areas_for_improvement',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'total_time_spent_seconds',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'started_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'completed_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create foreign keys for interview_sessions
    await queryRunner.createForeignKey(
      'interview_sessions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'interview_sessions',
      new TableForeignKey({
        columnNames: ['topic_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'interview_topics',
        onDelete: 'CASCADE',
      }),
    );

    // Create indexes for interview_sessions
    await queryRunner.query(
      `CREATE INDEX "IDX_interview_sessions_user_id" ON "interview_sessions" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_interview_sessions_topic_id" ON "interview_sessions" ("topic_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_interview_sessions_status" ON "interview_sessions" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_interview_sessions_created_at" ON "interview_sessions" ("created_at")`,
    );

    console.log('✅ Interview tables created successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.dropTable('interview_sessions', true);
    await queryRunner.dropTable('interview_questions', true);
    await queryRunner.dropTable('interview_topics', true);

    console.log('✅ Interview tables dropped successfully');
  }
}
