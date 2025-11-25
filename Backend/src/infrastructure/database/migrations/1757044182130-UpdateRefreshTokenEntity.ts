import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateRefreshTokenEntity1757044182130 implements MigrationInterface {
  name = 'UpdateRefreshTokenEntity1757044182130';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "deviceInfo"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expiresAt"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "isRevoked"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "user_id" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "token_hash" character varying(500) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash")`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "family_id" uuid NOT NULL`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "jti" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "UQ_f3752400c98d5c0b3dca54d66d5" UNIQUE ("jti")`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "replaced_by" uuid`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "revoked_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "reason" character varying(64)`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "device_info" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "ip_hash" character varying(128)`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "user_agent" character varying(255)`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f3752400c98d5c0b3dca54d66d" ON "refresh_tokens" ("jti") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5e27da0cd39bc3bb2811fc8ba" ON "refresh_tokens" ("family_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a7838d2ba25be1342091b6695f" ON "refresh_tokens" ("token_hash") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_a7838d2ba25be1342091b6695f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d5e27da0cd39bc3bb2811fc8ba"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f3752400c98d5c0b3dca54d66d"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "created_at"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "expires_at"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "user_agent"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "ip_hash"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "device_info"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "reason"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "revoked_at"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "replaced_by"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_f3752400c98d5c0b3dca54d66d5"`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "jti"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "family_id"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1"`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "token_hash"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "isRevoked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "deviceInfo" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD "token" character varying(500) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
