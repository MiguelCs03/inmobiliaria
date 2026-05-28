import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedBase1779925000000 implements MigrationInterface {
  name = 'SeedBase1779925000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rol administrador
    await queryRunner.query(`
      INSERT INTO "rol" ("nombre")
      SELECT 'Administrador'
      WHERE NOT EXISTS (SELECT 1 FROM "rol" WHERE "nombre" = 'Administrador');
    `);

    // Usuario administrador
    await queryRunner.query(`
      INSERT INTO "usuario" ("rol_id", "correo", "contrasenia_hash", "activo")
      SELECT r."id", 'admin@gmail.com', '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2', true
      FROM "rol" r
      WHERE r."nombre" = 'Administrador'
        AND NOT EXISTS (SELECT 1 FROM "usuario" WHERE "correo" = 'admin@gmail.com');
    `);

    // Tipos de propiedad
    await queryRunner.query(`
      INSERT INTO "tipo_propiedad" ("nombre")
      SELECT v.nombre
      FROM (VALUES ('Casa'), ('Departamento'), ('Terreno'), ('Oficina')) AS v(nombre)
      WHERE NOT EXISTS (SELECT 1 FROM "tipo_propiedad" t WHERE t."nombre" = v.nombre);
    `);

    // Tipos de operacion
    await queryRunner.query(`
      INSERT INTO "tipo_operacion" ("nombre")
      SELECT v.nombre
      FROM (VALUES ('Venta'), ('Alquiler')) AS v(nombre)
      WHERE NOT EXISTS (SELECT 1 FROM "tipo_operacion" t WHERE t."nombre" = v.nombre);
    `);

    // Estados de propiedad
    await queryRunner.query(`
      INSERT INTO "estado_propiedad" ("nombre")
      SELECT v.nombre
      FROM (VALUES ('Disponible'), ('Reservado'), ('Vendido')) AS v(nombre)
      WHERE NOT EXISTS (SELECT 1 FROM "estado_propiedad" e WHERE e."nombre" = v.nombre);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Limpiar usuario admin
    await queryRunner.query(`DELETE FROM "usuario" WHERE "correo" = 'admin@gmail.com';`);

    // Limpiar rol admin
    await queryRunner.query(`DELETE FROM "rol" WHERE "nombre" = 'Administrador';`);

    // Limpiar catalogos
    await queryRunner.query(`DELETE FROM "estado_propiedad" WHERE "nombre" IN ('Disponible', 'Reservado', 'Vendido');`);
    await queryRunner.query(`DELETE FROM "tipo_operacion" WHERE "nombre" IN ('Venta', 'Alquiler');`);
    await queryRunner.query(`DELETE FROM "tipo_propiedad" WHERE "nombre" IN ('Casa', 'Departamento', 'Terreno', 'Oficina');`);
  }
}
