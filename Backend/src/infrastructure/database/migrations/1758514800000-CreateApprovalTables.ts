import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateApprovalTables1758514800000 implements MigrationInterface {
  name = 'CreateApprovalTables1758514800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear tabla approval_rules
    await queryRunner.query(
      `CREATE TABLE "approval_rules" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "instructorId" uuid,
        "groupId" uuid,
        "ruleName" varchar(255) NOT NULL,
        "criteria" jsonb NOT NULL DEFAULT '{}',
        "weights" jsonb NOT NULL DEFAULT '{}',
        "thresholds" jsonb NOT NULL DEFAULT '{}',
        "isActive" boolean DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_approval_rules" PRIMARY KEY ("id")
      )`,
    );

    // Crear tabla approval_evaluations
    await queryRunner.query(
      `CREATE TABLE "approval_evaluations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "studentId" uuid NOT NULL,
        "sessionId" uuid NOT NULL,
        "chapterId" uuid NOT NULL,
        "ruleId" uuid NOT NULL,
        "metrics" jsonb NOT NULL DEFAULT '{}',
        "calculatedScore" float NOT NULL,
        "approved" boolean NOT NULL,
        "recommendations" jsonb DEFAULT '[]',
        "nextActions" jsonb DEFAULT '[]',
        "evaluatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_approval_evaluations" PRIMARY KEY ("id")
      )`,
    );

    // Crear tabla approval_metrics
    await queryRunner.query(
      `CREATE TABLE "approval_metrics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "evaluationId" uuid NOT NULL,
        "accuracy" float NOT NULL,
        "responseTime" float NOT NULL,
        "consistency" float NOT NULL,
        "vocabularyMastery" float NOT NULL,
        "grammarScore" float DEFAULT 0,
        "comprehensionScore" float DEFAULT 0,
        "detailedMetrics" jsonb DEFAULT '{}',
        CONSTRAINT "PK_approval_metrics" PRIMARY KEY ("id")
      )`,
    );

    // Crear índices para approval_rules
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_rules_instructor_id" ON "approval_rules" ("instructorId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_rules_group_id" ON "approval_rules" ("groupId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_rules_active" ON "approval_rules" ("isActive")`,
    );

    // Crear índices para approval_evaluations
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_evaluations_student_id" ON "approval_evaluations" ("studentId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_evaluations_session_id" ON "approval_evaluations" ("sessionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_evaluations_chapter_id" ON "approval_evaluations" ("chapterId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_evaluations_evaluated_at" ON "approval_evaluations" ("evaluatedAt" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_evaluations_approved" ON "approval_evaluations" ("approved")`,
    );

    // Crear índices para approval_metrics
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_metrics_evaluation_id" ON "approval_metrics" ("evaluationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_metrics_accuracy" ON "approval_metrics" ("accuracy" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_approval_metrics_vocabulary_mastery" ON "approval_metrics" ("vocabularyMastery" DESC)`,
    );

    // Crear foreign keys
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD CONSTRAINT "FK_approval_evaluations_student_id" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD CONSTRAINT "FK_approval_evaluations_chapter_id" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" ADD CONSTRAINT "FK_approval_evaluations_rule_id" FOREIGN KEY ("ruleId") REFERENCES "approval_rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" ADD CONSTRAINT "FK_approval_metrics_evaluation_id" FOREIGN KEY ("evaluationId") REFERENCES "approval_evaluations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Insertar regla de aprobación por defecto
    await queryRunner.query(
      `INSERT INTO "approval_rules" ("ruleName", "criteria", "weights", "thresholds") VALUES
      ('Regla Estándar de Vocabulario', 
       '{
         "vocabulary_required": true,
         "grammar_required": false,
         "comprehension_required": true
       }',
       '{
         "accuracy": 0.4,
         "vocabulary_mastery": 0.3,
         "response_time": 0.2,
         "consistency": 0.1
       }',
       '{
         "minimum_accuracy": 75,
         "minimum_vocabulary_mastery": 80,
         "maximum_response_time": 5.0,
         "minimum_consistency": 70,
         "chapter_4_threshold": 100,
         "chapter_5_threshold": 100,
         "general_threshold": 80
       }')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign keys
    await queryRunner.query(
      `ALTER TABLE "approval_metrics" DROP CONSTRAINT "FK_approval_metrics_evaluation_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP CONSTRAINT "FK_approval_evaluations_rule_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP CONSTRAINT "FK_approval_evaluations_chapter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "approval_evaluations" DROP CONSTRAINT "FK_approval_evaluations_student_id"`,
    );

    // Eliminar índices
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_metrics_vocabulary_mastery"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_metrics_accuracy"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_metrics_evaluation_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_evaluations_approved"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_evaluations_evaluated_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_evaluations_chapter_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_evaluations_session_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_evaluations_student_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_rules_active"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_rules_group_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_approval_rules_instructor_id"`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE "approval_metrics"`);
    await queryRunner.query(`DROP TABLE "approval_evaluations"`);
    await queryRunner.query(`DROP TABLE "approval_rules"`);
  }
}
