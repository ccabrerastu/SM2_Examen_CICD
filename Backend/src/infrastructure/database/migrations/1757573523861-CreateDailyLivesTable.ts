import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDailyLivesTable1757573523861 implements MigrationInterface {
  name = 'CreateDailyLivesTable1757573523861';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "daily_lives" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "currentLives" integer NOT NULL DEFAULT '5', "lastResetDate" date NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a6b5b1ff558acb23e6c9266fe42" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f032a063e6165150f953f61d83" ON "daily_lives" ("userId", "lastResetDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_39eea219bf9d981c4f1c10ef71" ON "daily_lives" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_lives" ADD CONSTRAINT "FK_39eea219bf9d981c4f1c10ef71f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_lives" DROP CONSTRAINT "FK_39eea219bf9d981c4f1c10ef71f"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_39eea219bf9d981c4f1c10ef71"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f032a063e6165150f953f61d83"`);
    await queryRunner.query(`DROP TABLE "daily_lives"`);
  }
}
