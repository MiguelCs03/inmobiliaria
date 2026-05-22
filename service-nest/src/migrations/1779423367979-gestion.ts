import { MigrationInterface, QueryRunner } from "typeorm";

export class Gestion1779423367979 implements MigrationInterface {
    name = 'Gestion1779423367979'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "propietario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nombres" character varying(100) NOT NULL, "telefono" character varying(20) NOT NULL, "ci_nit" character varying(30) NOT NULL, CONSTRAINT "PK_97b6ca7c3a5c40768ec179ad73b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipo_propiedad" ("id" SERIAL NOT NULL, "nombre" character varying(50) NOT NULL, CONSTRAINT "PK_2a9c749b4ed29422c5c5f5226f6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tipo_operacion" ("id" SERIAL NOT NULL, "nombre" character varying(50) NOT NULL, CONSTRAINT "PK_e95bee01112a3d6fa465b550f3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estado_propiedad" ("id" SERIAL NOT NULL, "nombre" character varying(50) NOT NULL, CONSTRAINT "PK_d6747b33a24c21bb5385a76e478" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "propiedad_imagen" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propiedad_id" uuid NOT NULL, "url_s3" character varying(255) NOT NULL, "procesada_ia" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_09dbc7be1b810b8487df60e5710" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sucursal" ("id" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "ciudad" character varying(50) NOT NULL, CONSTRAINT "PK_a3817e81fd6972dd2172d9c4e60" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "empleado" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "sucursal_id" integer NOT NULL, "nombres" character varying(100) NOT NULL, "apellidos" character varying(100) NOT NULL, CONSTRAINT "REL_82d9465c3816fcbeded6c374ae" UNIQUE ("usuario_id"), CONSTRAINT "PK_d15e7688d5ed23e9fdb570b2e5d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rol" ("id" SERIAL NOT NULL, "nombre" character varying(50) NOT NULL, CONSTRAINT "PK_c93a22388638fac311781c7f2dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "usuario" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "rol_id" integer NOT NULL, "correo" character varying(150) NOT NULL, "contrasenia_hash" character varying(255) NOT NULL, "activo" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_349ecb64acc4355db443ca17cbd" UNIQUE ("correo"), CONSTRAINT "PK_a56c58e5cabaa04fb2c98d2d7e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cliente" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid, "nombres" character varying(100) NOT NULL, "telefono" character varying(20) NOT NULL, "ci_nit" character varying(30) NOT NULL, CONSTRAINT "REL_51a4d9370abe0523f208ef3f43" UNIQUE ("usuario_id"), CONSTRAINT "PK_18990e8df6cf7fe71b9dc0f5f39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pago" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "factura_id" uuid NOT NULL, "monto" numeric(12,2) NOT NULL, "metodo" character varying(50) NOT NULL, CONSTRAINT "PK_6be14be998d5e41f10e58c0e651" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "factura" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "plan_pago_id" uuid NOT NULL, "nro_factura" character varying(30) NOT NULL, "monto_total" numeric(12,2) NOT NULL, "fecha_emision" TIMESTAMP NOT NULL, CONSTRAINT "UQ_26babef3ce3453fd7cc4eff9d2b" UNIQUE ("nro_factura"), CONSTRAINT "PK_ca804984009ea42a7b46adb9a86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."plan_pagos_estado_enum" AS ENUM('Pendiente', 'Pagado')`);
        await queryRunner.query(`CREATE TABLE "plan_pagos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contrato_id" uuid NOT NULL, "nro_cuota" integer NOT NULL, "monto_cuota" numeric(12,2) NOT NULL, "estado" "public"."plan_pagos_estado_enum" NOT NULL DEFAULT 'Pendiente', CONSTRAINT "PK_6c154769c6036a27db35430f4cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "contrato" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propiedad_id" uuid NOT NULL, "cliente_id" uuid NOT NULL, "empleado_id" uuid NOT NULL, "monto_total" numeric(12,2) NOT NULL, "estado_contrato" character varying(30), "documento_nosql_id" character varying(50), CONSTRAINT "PK_b82cfcedf2037eab18ca2714ef9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "propiedad" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propietario_id" uuid NOT NULL, "tipo_propiedad_id" integer NOT NULL, "tipo_operacion_id" integer NOT NULL, "estado_propiedad_id" integer NOT NULL, "precio_base" numeric(12,2) NOT NULL, "area_m2" numeric(10,2) NOT NULL, "ubicacion" character varying(255), "detalles_json" jsonb, CONSTRAINT "PK_78e6c440a5d7863829c61e23f41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "visita" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "propiedad_id" uuid NOT NULL, "cliente_id" uuid NOT NULL, "empleado_id" uuid NOT NULL, "fecha_visita" TIMESTAMP NOT NULL, CONSTRAINT "PK_8ffe9de9ae8f45fbeaaea4d5552" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "propiedad_imagen" ADD CONSTRAINT "FK_133574dace1f80b0418d6a08d69" FOREIGN KEY ("propiedad_id") REFERENCES "propiedad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empleado" ADD CONSTRAINT "FK_82d9465c3816fcbeded6c374ae9" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "empleado" ADD CONSTRAINT "FK_49778622b1c20506be43d01066b" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario" ADD CONSTRAINT "FK_6c336b0a51b5c4d22614cb02533" FOREIGN KEY ("rol_id") REFERENCES "rol"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cliente" ADD CONSTRAINT "FK_51a4d9370abe0523f208ef3f43d" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pago" ADD CONSTRAINT "FK_a120b7486ee0d2e5c1f21c72669" FOREIGN KEY ("factura_id") REFERENCES "factura"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "factura" ADD CONSTRAINT "FK_014ce5e76a65d184e019eff73df" FOREIGN KEY ("plan_pago_id") REFERENCES "plan_pagos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "plan_pagos" ADD CONSTRAINT "FK_ac7a07bb5260f2d374cc9d6a1da" FOREIGN KEY ("contrato_id") REFERENCES "contrato"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD CONSTRAINT "FK_c19efc3075fdc161ab04d7f6912" FOREIGN KEY ("propiedad_id") REFERENCES "propiedad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD CONSTRAINT "FK_1d3656b9a06832b90b22ac0280e" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "contrato" ADD CONSTRAINT "FK_e43c6d9f7518fe05facd45c46ef" FOREIGN KEY ("empleado_id") REFERENCES "empleado"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propiedad" ADD CONSTRAINT "FK_efdf99f746348b559f2a335fd7f" FOREIGN KEY ("propietario_id") REFERENCES "propietario"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propiedad" ADD CONSTRAINT "FK_15c7b4f01054302c788b2597da1" FOREIGN KEY ("tipo_propiedad_id") REFERENCES "tipo_propiedad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propiedad" ADD CONSTRAINT "FK_1b7bf2d3faba30d859ff45e82d6" FOREIGN KEY ("tipo_operacion_id") REFERENCES "tipo_operacion"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "propiedad" ADD CONSTRAINT "FK_6a51c483585274f042d6bd24ad5" FOREIGN KEY ("estado_propiedad_id") REFERENCES "estado_propiedad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_d4c549c457c1a92b298bd76dd2d" FOREIGN KEY ("propiedad_id") REFERENCES "propiedad"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_0ae470ee62d58554d46bc614672" FOREIGN KEY ("cliente_id") REFERENCES "cliente"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "visita" ADD CONSTRAINT "FK_2a5ffcdef5bab841c40eced9998" FOREIGN KEY ("empleado_id") REFERENCES "empleado"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_2a5ffcdef5bab841c40eced9998"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_0ae470ee62d58554d46bc614672"`);
        await queryRunner.query(`ALTER TABLE "visita" DROP CONSTRAINT "FK_d4c549c457c1a92b298bd76dd2d"`);
        await queryRunner.query(`ALTER TABLE "propiedad" DROP CONSTRAINT "FK_6a51c483585274f042d6bd24ad5"`);
        await queryRunner.query(`ALTER TABLE "propiedad" DROP CONSTRAINT "FK_1b7bf2d3faba30d859ff45e82d6"`);
        await queryRunner.query(`ALTER TABLE "propiedad" DROP CONSTRAINT "FK_15c7b4f01054302c788b2597da1"`);
        await queryRunner.query(`ALTER TABLE "propiedad" DROP CONSTRAINT "FK_efdf99f746348b559f2a335fd7f"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP CONSTRAINT "FK_e43c6d9f7518fe05facd45c46ef"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP CONSTRAINT "FK_1d3656b9a06832b90b22ac0280e"`);
        await queryRunner.query(`ALTER TABLE "contrato" DROP CONSTRAINT "FK_c19efc3075fdc161ab04d7f6912"`);
        await queryRunner.query(`ALTER TABLE "plan_pagos" DROP CONSTRAINT "FK_ac7a07bb5260f2d374cc9d6a1da"`);
        await queryRunner.query(`ALTER TABLE "factura" DROP CONSTRAINT "FK_014ce5e76a65d184e019eff73df"`);
        await queryRunner.query(`ALTER TABLE "pago" DROP CONSTRAINT "FK_a120b7486ee0d2e5c1f21c72669"`);
        await queryRunner.query(`ALTER TABLE "cliente" DROP CONSTRAINT "FK_51a4d9370abe0523f208ef3f43d"`);
        await queryRunner.query(`ALTER TABLE "usuario" DROP CONSTRAINT "FK_6c336b0a51b5c4d22614cb02533"`);
        await queryRunner.query(`ALTER TABLE "empleado" DROP CONSTRAINT "FK_49778622b1c20506be43d01066b"`);
        await queryRunner.query(`ALTER TABLE "empleado" DROP CONSTRAINT "FK_82d9465c3816fcbeded6c374ae9"`);
        await queryRunner.query(`ALTER TABLE "propiedad_imagen" DROP CONSTRAINT "FK_133574dace1f80b0418d6a08d69"`);
        await queryRunner.query(`DROP TABLE "visita"`);
        await queryRunner.query(`DROP TABLE "propiedad"`);
        await queryRunner.query(`DROP TABLE "contrato"`);
        await queryRunner.query(`DROP TABLE "plan_pagos"`);
        await queryRunner.query(`DROP TYPE "public"."plan_pagos_estado_enum"`);
        await queryRunner.query(`DROP TABLE "factura"`);
        await queryRunner.query(`DROP TABLE "pago"`);
        await queryRunner.query(`DROP TABLE "cliente"`);
        await queryRunner.query(`DROP TABLE "usuario"`);
        await queryRunner.query(`DROP TABLE "rol"`);
        await queryRunner.query(`DROP TABLE "empleado"`);
        await queryRunner.query(`DROP TABLE "sucursal"`);
        await queryRunner.query(`DROP TABLE "propiedad_imagen"`);
        await queryRunner.query(`DROP TABLE "estado_propiedad"`);
        await queryRunner.query(`DROP TABLE "tipo_operacion"`);
        await queryRunner.query(`DROP TABLE "tipo_propiedad"`);
        await queryRunner.query(`DROP TABLE "propietario"`);
    }

}
