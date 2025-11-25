import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChapterRepetitionsTable1758229800000 implements MigrationInterface {
  name = 'CreateChapterRepetitionsTable1758229800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla chapter_repetitions
    await queryRunner.query(
      `CREATE TABLE "chapter_repetitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "chapter_id" uuid NOT NULL,
        "original_progress_id" uuid NOT NULL,
        "repetition_score" integer,
        "session_type" varchar(20) NOT NULL DEFAULT 'practice',
        "status" varchar(20) NOT NULL DEFAULT 'active',
        "exercise_results" jsonb NOT NULL DEFAULT '{}',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_chapter_repetitions" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_repetition_score_range" CHECK (repetition_score >= 0 AND repetition_score <= 100),
        CONSTRAINT "CHK_session_type_values" CHECK (session_type IN ('practice', 'review', 'challenge')),
        CONSTRAINT "CHK_status_values" CHECK (status IN ('active', 'completed', 'abandoned'))
      )`,
    );

    // Crear índices
    await queryRunner.query(
      `CREATE INDEX "IDX_chapter_repetitions_user_id" ON "chapter_repetitions" ("user_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_chapter_repetitions_chapter_id" ON "chapter_repetitions" ("chapter_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_chapter_repetitions_original_progress" ON "chapter_repetitions" ("original_progress_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_chapter_repetitions_status" ON "chapter_repetitions" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_chapter_repetitions_created_at" ON "chapter_repetitions" ("created_at" DESC)`,
    );

    // Crear trigger para updated_at
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
       RETURNS TRIGGER AS $$
       BEGIN
           NEW.updated_at = NOW();
           RETURN NEW;
       END;
       $$ language 'plpgsql'`,
    );

    await queryRunner.query(
      `CREATE TRIGGER update_chapter_repetitions_updated_at
       BEFORE UPDATE ON "chapter_repetitions"
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()`,
    );

    // Crear foreign keys
    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" ADD CONSTRAINT "FK_chapter_repetitions_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" ADD CONSTRAINT "FK_chapter_repetitions_chapter_id" 
       FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" ADD CONSTRAINT "FK_chapter_repetitions_original_progress_id" 
       FOREIGN KEY ("original_progress_id") REFERENCES "user_progress"("id") ON DELETE CASCADE`,
    );

    // Habilitar RLS
    await queryRunner.query(`ALTER TABLE "chapter_repetitions" ENABLE ROW LEVEL SECURITY`);

    // Crear políticas RLS
    await queryRunner.query(
      `CREATE POLICY "Users can view their own repetitions" ON "chapter_repetitions"
       FOR SELECT USING (auth.uid() = user_id)`,
    );

    await queryRunner.query(
      `CREATE POLICY "Users can insert their own repetitions" ON "chapter_repetitions"
       FOR INSERT WITH CHECK (auth.uid() = user_id)`,
    );

    await queryRunner.query(
      `CREATE POLICY "Users can update their own repetitions" ON "chapter_repetitions"
       FOR UPDATE USING (auth.uid() = user_id)`,
    );

    // Permisos para Supabase
    await queryRunner.query(`GRANT SELECT ON "chapter_repetitions" TO anon`);

    await queryRunner.query(`GRANT ALL PRIVILEGES ON "chapter_repetitions" TO authenticated`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar políticas RLS
    await queryRunner.query(
      `DROP POLICY IF EXISTS "Users can update their own repetitions" ON "chapter_repetitions"`,
    );

    await queryRunner.query(
      `DROP POLICY IF EXISTS "Users can insert their own repetitions" ON "chapter_repetitions"`,
    );

    await queryRunner.query(
      `DROP POLICY IF EXISTS "Users can view their own repetitions" ON "chapter_repetitions"`,
    );

    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" DROP CONSTRAINT "FK_chapter_repetitions_original_progress_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" DROP CONSTRAINT "FK_chapter_repetitions_chapter_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE "chapter_repetitions" DROP CONSTRAINT "FK_chapter_repetitions_user_id"`,
    );

    // Eliminar trigger
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS update_chapter_repetitions_updated_at ON "chapter_repetitions"`,
    );

    // Eliminar función
    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column()`);

    // Eliminar índices
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapter_repetitions_created_at"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapter_repetitions_status"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapter_repetitions_original_progress"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapter_repetitions_chapter_id"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_chapter_repetitions_user_id"`);

    // Eliminar tabla
    await queryRunner.query(`DROP TABLE "chapter_repetitions"`);
  }
}
