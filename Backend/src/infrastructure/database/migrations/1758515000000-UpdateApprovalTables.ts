import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateApprovalTables1758515000000 implements MigrationInterface {
  name = 'UpdateApprovalTables1758515000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Actualizar tabla approval_rules para que coincida con la entidad
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "instructorId"`);
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "groupId"`);
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "ruleName"`);
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "criteria"`);
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "weights"`);
    await queryRunner.query(`ALTER TABLE "approval_rules" DROP COLUMN IF EXISTS "thresholds"`);

    // Agregar columnas que faltan en approval_rules
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "name" varchar(255) NOT NULL DEFAULT 'Default Rule'`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "chapterId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "minScoreThreshold" numeric(5,2) NOT NULL DEFAULT 80.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "maxAttempts" int NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "allowErrorCarryover" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_rules" ADD COLUMN IF NOT EXISTS "metadata" jsonb`,
    );

    // Actualizar tabla approval_evaluations para que coincida con la entidad
    await queryRunner.query(`ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "sessionId"`);
    await queryRunner.query(`ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "metrics"`);
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "calculatedScore"`,
    );
    await queryRunner.query(`ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "approved"`);
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "recommendations"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP COLUMN IF EXISTS "nextActions"`,
    );

    // Renombrar columnas en approval_evaluations
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" RENAME COLUMN "studentId" TO "userId"`,
    );

    // Agregar columnas que faltan en approval_evaluations
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "score" numeric(10,2) NOT NULL DEFAULT 0.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "threshold" numeric(5,2) NOT NULL DEFAULT 80.00`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "status" varchar(20) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "attemptNumber" int NOT NULL DEFAULT 1`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "errorsFromPreviousAttempts" int NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "feedback" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD COLUMN IF NOT EXISTS "evaluationData" jsonb`,
    );

    // Actualizar tabla approval_metrics para que coincida con la entidad
    await queryRunner.query(`ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "accuracy"`);
    await queryRunner.query(`ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "responseTime"`);
    await queryRunner.query(`ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "consistency"`);
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "vocabularyMastery"`,
    );
    await queryRunner.query(`ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "grammarScore"`);
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "comprehensionScore"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "detailedMetrics"`,
    );
    await queryRunner.query(`ALTER TABLE "approval_metrics" DROP COLUMN IF EXISTS "evaluationId"`);

    // Agregar columnas que faltan en approval_metrics
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "chapterId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "metricType" varchar(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "value" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "unit" varchar(50)`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "additionalData" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "recordedAt" timestamptz NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT now()`,
    );

    // Crear nuevos índices para approval_rules
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_rules_chapter_id" ON "approval_rules" ("chapterId")`,
    );

    // Crear nuevos índices para approval_evaluations
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_evaluations_status" ON "approval_evaluations" ("status")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_approval_evaluations_user_chapter_attempt" ON "approval_evaluations" ("userId", "chapterId", "attemptNumber")`,
    );

    // Crear nuevos índices para approval_metrics
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_metrics_user_id" ON "approval_metrics" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_metrics_chapter_id" ON "approval_metrics" ("chapterId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_metrics_metric_type" ON "approval_metrics" ("metricType")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_approval_metrics_recorded_at" ON "approval_metrics" ("recordedAt")`,
    );

    // Agregar foreign keys para approval_metrics
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD CONSTRAINT "FK_approval_metrics_user_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revertir cambios (implementación básica)
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" DROP CONSTRAINT IF EXISTS "FK_approval_metrics_user_id"`,
    );

    // Eliminar índices creados
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_metrics_recorded_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_metrics_metric_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_metrics_chapter_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_metrics_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_evaluations_user_chapter_attempt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_evaluations_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_approval_rules_chapter_id"`);
  }
}
