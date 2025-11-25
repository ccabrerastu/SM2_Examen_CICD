import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTranslationTable1758820000000 implements MigrationInterface {
  name = 'CreateTranslationTable1758820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types for translation status and source
    await queryRunner.query(
      `CREATE TYPE "public"."translations_status_enum" AS ENUM('ACTIVE', 'CACHED', 'EXPIRED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."translations_source_enum" AS ENUM('GOOGLE_TRANSLATE', 'DEEPL', 'MANUAL', 'VOCABULARY')`,
    );

    // Create translations table
    await queryRunner.query(
      `CREATE TABLE "translations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "originalText" text NOT NULL,
        "translatedText" text NOT NULL,
        "sourceLanguage" character varying(10) NOT NULL,
        "targetLanguage" character varying(10) NOT NULL,
        "pronunciation" character varying(500),
        "examples" text array DEFAULT '{}',
        "audioUrl" character varying(500),
        "definition" text,
        "context" text,
        "status" "public"."translations_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "source" "public"."translations_source_enum" NOT NULL DEFAULT 'GOOGLE_TRANSLATE',
        "expiresAt" TIMESTAMP WITH TIME ZONE,
        "metadata" jsonb DEFAULT '{}',
        "usageCount" integer NOT NULL DEFAULT 1,
        "lastUsedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_translations_id" PRIMARY KEY ("id")
      )`,
    );

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_original_text" ON "translations" ("originalText")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_language_pair" ON "translations" ("sourceLanguage", "targetLanguage")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_translations_status" ON "translations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_translations_source" ON "translations" ("source")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_expires_at" ON "translations" ("expiresAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_last_used_at" ON "translations" ("lastUsedAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_created_at" ON "translations" ("createdAt")`,
    );

    // Create composite index for cache lookup optimization
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_cache_lookup" ON "translations" ("originalText", "sourceLanguage", "targetLanguage", "status")`,
    );

    // Create index for cleanup operations
    await queryRunner.query(
      `CREATE INDEX "IDX_translations_cleanup" ON "translations" ("status", "expiresAt") WHERE "status" = 'EXPIRED'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_translations_cleanup"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_cache_lookup"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_last_used_at"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_source"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_status"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_language_pair"`);
    await queryRunner.query(`DROP INDEX "IDX_translations_original_text"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "translations"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."translations_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."translations_status_enum"`);
  }
}
