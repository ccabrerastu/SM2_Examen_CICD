import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReadingTables1759000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create reading_chapters table
    await queryRunner.query(`
      CREATE TABLE "reading_chapters" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(255) NOT NULL,
        "level" integer NOT NULL DEFAULT 1,
        "order" integer NOT NULL UNIQUE,
        "description" text,
        "imageUrl" varchar(255),
        "topic" varchar(100),
        "metadata" jsonb,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reading_chapters_order" ON "reading_chapters" ("order");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reading_chapters_level" ON "reading_chapters" ("level");
    `);

    // Create reading_contents table
    await queryRunner.query(`
      CREATE TABLE "reading_contents" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "readingChapterId" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "content" jsonb NOT NULL,
        "highlightedWords" jsonb NOT NULL,
        "totalPages" integer NOT NULL DEFAULT 3,
        "estimatedReadingTime" integer,
        "topic" varchar(100),
        "level" varchar(20) NOT NULL DEFAULT 'BASIC',
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_reading_contents_chapter" FOREIGN KEY ("readingChapterId")
          REFERENCES "reading_chapters"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reading_contents_chapterId" ON "reading_contents" ("readingChapterId");
    `);

    // Create quiz_questions table
    await queryRunner.query(`
      CREATE TABLE "quiz_questions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "readingContentId" uuid NOT NULL,
        "questionText" text NOT NULL,
        "options" jsonb NOT NULL,
        "correctAnswer" integer NOT NULL,
        "hint" text NOT NULL,
        "explanation" text,
        "order" integer NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "FK_quiz_questions_content" FOREIGN KEY ("readingContentId")
          REFERENCES "reading_contents"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quiz_questions_contentId" ON "quiz_questions" ("readingContentId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_quiz_questions_order" ON "quiz_questions" ("order");
    `);

    // Add readingChapterId to user_progress table
    await queryRunner.query(`
      ALTER TABLE "user_progress" ADD COLUMN "readingChapterId" uuid;
    `);

    await queryRunner.query(`
      ALTER TABLE "user_progress" ALTER COLUMN "chapterId" DROP NOT NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_user_progress_readingChapterId" ON "user_progress" ("readingChapterId");
    `);

    await queryRunner.query(`
      ALTER TABLE "user_progress"
        ADD CONSTRAINT "FK_user_progress_reading_chapter"
        FOREIGN KEY ("readingChapterId")
        REFERENCES "reading_chapters"("id") ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_progress" DROP CONSTRAINT "FK_user_progress_reading_chapter"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_user_progress_readingChapterId"`);
    await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "readingChapterId"`);
    await queryRunner.query(`ALTER TABLE "user_progress" ALTER COLUMN "chapterId" SET NOT NULL`);
    await queryRunner.query(`DROP TABLE "quiz_questions"`);
    await queryRunner.query(`DROP TABLE "reading_contents"`);
    await queryRunner.query(`DROP TABLE "reading_chapters"`);
  }
}
