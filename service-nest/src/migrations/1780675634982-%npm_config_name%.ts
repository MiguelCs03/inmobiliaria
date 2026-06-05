import { MigrationInterface, QueryRunner } from "typeorm";
export class FixTables1780675634982 implements MigrationInterface {
     name = 'FixTables1780675634982'//asi,

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "segmento" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "PK_0f5c538fc22bd6d5194d936f683" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "preferencias" ("id" BIGSERIAL NOT NULL, "cliente_id" bigint NOT NULL, "presupuesto_max" numeric(12,2), "tipo_propiedad_buscada" character varying(100), "habitaciones_minimo" integer, "zona_preferida" character varying(150), CONSTRAINT "PK_741f9011e185292c350407bd2a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD "segmento_id" integer`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "titulo" character varying(500) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "fecha_inicio" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "fecha_fin" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "observaciones" text`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "document_hash" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "pdf_url" text`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD "blockchain_contract_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "preferencias" ADD CONSTRAINT "FK_23fcadf1bb0bd13ed62f04cad84" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD CONSTRAINT "FK_4924fbab748ef20744e64a9a537" FOREIGN KEY ("segmento_id") REFERENCES "segmento"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cliente" DROP CONSTRAINT "FK_4924fbab748ef20744e64a9a537"`);
        await queryRunner.query(`ALTER TABLE "preferencias" DROP CONSTRAINT "FK_23fcadf1bb0bd13ed62f04cad84"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "blockchain_contract_id"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "pdf_url"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "document_hash"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "observaciones"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "fecha_fin"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "fecha_inicio"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP COLUMN "titulo"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP COLUMN "segmento_id"`);
        await queryRunner.query(`DROP TABLE "preferencias"`);
        await queryRunner.query(`DROP TABLE "segmento"`);
    }

}
