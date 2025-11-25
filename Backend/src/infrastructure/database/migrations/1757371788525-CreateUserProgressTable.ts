import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserProgressTable1757371788525 implements MigrationInterface {
  name = 'CreateUserProgressTable1757371788525';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "chapterId" uuid NOT NULL, "score" numeric(10,2), "lastActivity" TIMESTAMP WITH TIME ZONE NOT NULL, "extraData" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7b5eb2436efb0051fdf05cbe839" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b5d0e1b57bc6c761fb49e79bf8" ON "user_progress" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_progress" ADD CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_progress" DROP CONSTRAINT "FK_b5d0e1b57bc6c761fb49e79bf89"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_b5d0e1b57bc6c761fb49e79bf8"`);
    await queryRunner.query(`DROP TABLE "user_progress"`);
  }
}
