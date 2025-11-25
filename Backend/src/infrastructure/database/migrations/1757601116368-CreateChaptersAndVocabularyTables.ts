import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChaptersAndVocabularyTables1757601116368 implements MigrationInterface {
  name = 'CreateChaptersAndVocabularyTables1757601116368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vocabulary_items_type_enum" AS ENUM('word', 'phrase', 'expression')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."vocabulary_items_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vocabulary_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "chapterId" uuid NOT NULL, "englishTerm" character varying(255) NOT NULL, "spanishTranslation" character varying(255) NOT NULL, "type" "public"."vocabulary_items_type_enum" NOT NULL DEFAULT 'word', "difficulty" "public"."vocabulary_items_difficulty_enum" NOT NULL DEFAULT 'easy', "definition" text, "exampleSentence" character varying(500), "exampleTranslation" character varying(500), "pronunciation" character varying(255), "audioUrl" character varying(255), "imageUrl" character varying(255), "tags" text array, "metadata" jsonb, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3cb1bdc0a278d14cf12d9859ca7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7240905c63f05abd1f27c34b6" ON "vocabulary_items" ("englishTerm") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1c297fc33b517885370adf22eb" ON "vocabulary_items" ("type", "difficulty") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c688154f9fcd00b297edcfdb88" ON "vocabulary_items" ("chapterId") `,
    );
    await queryRunner.query(`CREATE TYPE "public"."chapters_level_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(
      `CREATE TABLE "chapters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "level" "public"."chapters_level_enum" NOT NULL DEFAULT '1', "order" integer NOT NULL, "isUnlocked" boolean NOT NULL DEFAULT false, "description" text, "imageUrl" character varying(255), "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a2bbdbb4bdc786fe0cb0fcfc4a0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fff2d62c07af5fb02b64970e09" ON "chapters" ("level", "order") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d4b7dead298f04c4761b8f94d9" ON "chapters" ("order") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD "chapterCompleted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD "chapterCompletionDate" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD "vocabularyItemsLearned" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD "totalVocabularyItems" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d8f5dc5e9521a8b1e2bc1e7057" ON "user_progress" ("chapterCompleted") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4f93fb77effff1b1afa22b7ada" ON "user_progress" ("userId", "chapterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_219170359a4b47df749c5f8735" ON "user_progress" ("chapterId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "vocabulary_items" ADD CONSTRAINT "FK_c688154f9fcd00b297edcfdb889" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD CONSTRAINT "FK_219170359a4b47df749c5f87358" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_progress" DROP CONSTRAINT "FK_219170359a4b47df749c5f87358"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vocabulary_items" DROP CONSTRAINT "FK_c688154f9fcd00b297edcfdb889"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_219170359a4b47df749c5f8735"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4f93fb77effff1b1afa22b7ada"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d8f5dc5e9521a8b1e2bc1e7057"`);
    await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "totalVocabularyItems"`);
    await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "vocabularyItemsLearned"`);
    await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "chapterCompletionDate"`);
    await queryRunner.query(`ALTER TABLE "user_progress" DROP COLUMN "chapterCompleted"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d4b7dead298f04c4761b8f94d9"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fff2d62c07af5fb02b64970e09"`);
    await queryRunner.query(`DROP TABLE "chapters"`);
    await queryRunner.query(`DROP TYPE "public"."chapters_level_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c688154f9fcd00b297edcfdb88"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1c297fc33b517885370adf22eb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d7240905c63f05abd1f27c34b6"`);
    await queryRunner.query(`DROP TABLE "vocabulary_items"`);
    await queryRunner.query(`DROP TYPE "public"."vocabulary_items_difficulty_enum"`);
    await queryRunner.query(`DROP TYPE "public"."vocabulary_items_type_enum"`);
  }
}
