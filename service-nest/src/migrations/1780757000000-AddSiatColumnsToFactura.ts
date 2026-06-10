import { MigrationInterface, QueryRunner } from "typeorm";

// Migración para añadir las columnas requeridas por el SIAT en la tabla factura
export class AddSiatColumnsToFactura1780757000000 implements MigrationInterface {
    name = 'AddSiatColumnsToFactura1780757000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "factura" ADD "cuf" character varying(150)`);
        await queryRunner.query(`ALTER TABLE "factura" ADD "codigo_recepcion" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "factura" ADD "estado_siat" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "factura" ADD "nit_cliente" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "factura" ADD "razon_social" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "factura" ADD "cufd_usado" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "cufd_usado"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "razon_social"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "nit_cliente"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "estado_siat"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "codigo_recepcion"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP COLUMN "cuf"`);
    }
}
