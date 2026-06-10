import { MigrationInterface, QueryRunner } from "typeorm";

// Migración para poblar datos por defecto de sucursal y empleado vinculados al admin
export class SeedDefaultEmpleadoAndSucursal1780758000000 implements MigrationInterface {
    name = 'SeedDefaultEmpleadoAndSucursal1780758000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Insertar sucursal central por defecto
        await queryRunner.query(`
            INSERT INTO "sucursal" ("id", "nombre", "ciudad", "activo")
            VALUES (1, 'Central', 'Santa Cruz', true)
            ON CONFLICT ("id") DO NOTHING;
        `);

        // 2. Reiniciar la secuencia de ID de sucursal por seguridad
        await queryRunner.query(`
            SELECT setval(pg_get_serial_sequence('sucursal', 'id'), COALESCE(MAX(id), 1)) FROM "sucursal";
        `);

        // 3. Crear empleado vinculado al usuario admin@gmail.com
        await queryRunner.query(`
            INSERT INTO "empleado" ("id", "usuario_id", "sucursal_id", "nombres", "apellidos", "activo")
            SELECT 1, u."id", 1, 'Admin', 'Administrador', true
            FROM "usuario" u
            WHERE u."correo" = 'admin@gmail.com'
              AND NOT EXISTS (SELECT 1 FROM "empleado" WHERE "id" = 1 OR "usuario_id" = u."id");
        `);

        // 4. Reiniciar la secuencia de ID de empleado por seguridad
        await queryRunner.query(`
            SELECT setval(pg_get_serial_sequence('empleado', 'id'), COALESCE(MAX(id), 1)) FROM "empleado";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "empleado" WHERE "id" = 1;`);
        await queryRunner.query(`DELETE FROM "sucursal" WHERE "id" = 1;`);
    }
}
