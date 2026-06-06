import { MigrationInterface, QueryRunner } from "typeorm";

export class  FixTables1780715733778 implements MigrationInterface {
    name = 'FixTables1780715733778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "firma_contrato" ("id" SERIAL NOT NULL, "contrato_id" bigint NOT NULL, "tipo_firmante" character varying(20) NOT NULL, "signature_url" text NOT NULL, "fecha_firma" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0e506ed31cbfc7a6fb2510baf58" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "firma_contrato" ADD CONSTRAINT "FK_fa7006536021edf92ca1a1c3370" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "firma_contrato" DROP CONSTRAINT "FK_fa7006536021edf92ca1a1c3370"`);
        await queryRunner.query(`DROP TABLE "firma_contrato"`);
    }

}
