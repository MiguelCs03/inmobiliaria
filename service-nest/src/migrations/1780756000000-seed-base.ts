import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedBase1780756000000 implements MigrationInterface {
  name = 'SeedBase1780756000000'

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

    // Segmentos K-Means
    await queryRunner.query(`
      INSERT INTO "segmento" ("id", "nombre")
      SELECT v.id, v.nombre
      FROM (VALUES (1, 'Comprador premium'), (2, 'Arrendatario joven'), (3, 'Inversor patrimonial'), (4, 'Familia en crecimiento'), (5, 'Profesional soltero')) AS v(id, nombre)
      WHERE NOT EXISTS (SELECT 1 FROM "segmento" s WHERE s."id" = v.id);
    `);

    // Propietarios
    await queryRunner.query(`
      INSERT INTO "propietario" ("nombres", "telefono", "ci_nit", "activo")
      SELECT v.nombres, v.telefono, v.ci_nit, true
      FROM (VALUES
        ('Juan Pérez', '70012345', '1234567'),
        ('María García', '70023456', '2345678'),
        ('Carlos López', '70034567', '3456789'),
        ('Ana Rojas', '70045678', '4567890')
      ) AS v(nombres, telefono, ci_nit)
      WHERE NOT EXISTS (SELECT 1 FROM "propietario" p WHERE p."ci_nit" = v.ci_nit);
    `);

    // Propiedades
    await queryRunner.query(`
      INSERT INTO "propiedad" ("propietario_id", "tipo_propiedad_id", "tipo_operacion_id", "estado_propiedad_id", "precio_base", "area_m2", "ubicacion", "detalles_json")
      SELECT
        (SELECT p."id" FROM "propietario" p  WHERE p."ci_nit" = v.ci_nit LIMIT 1),
        (SELECT tp."id" FROM "tipo_propiedad" tp WHERE tp."nombre" = v.tipo LIMIT 1),
        (SELECT toper."id" FROM "tipo_operacion" toper WHERE toper."nombre" = v.operacion LIMIT 1),
        (SELECT ep."id" FROM "estado_propiedad" ep WHERE ep."nombre" = v.estado LIMIT 1),
        v.precio, v.area, v.ubicacion, v.detalles::jsonb
      FROM (VALUES
        ('1234567', 'Casa', 'Venta', 'Disponible', 350000, 300, 'Equipetrol, Av. San Martín', '{"habitaciones": 4, "banos": 3, "garage": true, "piscina": true}'),
        ('2345678', 'Departamento', 'Venta', 'Disponible', 80000, 60, 'Centro, Calle Bolívar 123', '{"habitaciones": 2, "banos": 1, "garage": false}'),
        ('3456789', 'Terreno', 'Venta', 'Disponible', 120000, 500, 'Urbarí, Av. Beni 456', '{"topografia": "plano", "servicios": true}'),
        ('4567890', 'Oficina', 'Venta', 'Disponible', 60000, 45, 'Zona Norte, Av. Cristóbal 789', '{"ambientes": 3, "banos": 1}'),
        ('1234567', 'Casa', 'Venta', 'Disponible', 200000, 250, 'Urbarí, Calle 2 #100', '{"habitaciones": 3, "banos": 2, "garage": true}'),
        ('2345678', 'Departamento', 'Venta', 'Disponible', 150000, 90, 'Equipetrol Av. San Martín #200', '{"habitaciones": 3, "banos": 2, "garage": true, "piscina": true}'),
        ('3456789', 'Terreno', 'Venta', 'Disponible', 300000, 1000, 'Av. Beni km 7', '{"topografia": "plano", "servicios": true, "uso": "industrial"}'),
        ('4567890', 'Casa', 'Venta', 'Reservado', 95000, 120, 'Centro, Calle Sucre 456', '{"habitaciones": 3, "banos": 1, "garage": false}'),
        ('1234567', 'Departamento', 'Alquiler', 'Disponible', 500, 50, 'Centro, Calle 21 de Mayo #50', '{"habitaciones": 1, "banos": 1, "amueblado": false}'),
        ('2345678', 'Oficina', 'Alquiler', 'Disponible', 800, 40, 'Equipetrol, Edif. Business Tower', '{"ambientes": 2, "banos": 1, "seguridad": true}'),
        ('3456789', 'Casa', 'Alquiler', 'Disponible', 1200, 200, 'Urbarí, Av. Beni #789', '{"habitaciones": 3, "banos": 2, "garage": true, "jardin": true}'),
        ('4567890', 'Terreno', 'Venta', 'Disponible', 250000, 800, 'Zona Sur, Av. Circunvalación', '{"topografia": "plano", "servicios": true, "uso": "comercial"}')
      ) AS v(ci_nit, tipo, operacion, estado, precio, area, ubicacion, detalles)
      WHERE NOT EXISTS (SELECT 1 FROM "propiedad" pr WHERE pr."ubicacion" = v.ubicacion LIMIT 1);
    `);

    // Clientes con segmento asignado
    await queryRunner.query(`
      INSERT INTO "cliente" ("nombres", "telefono", "ci_nit", "segmento_id", "activo")
      SELECT v.nombres, v.telefono, v.ci_nit, v.segmento_id, true
      FROM (VALUES
        ('Pedro Rodríguez', '71011111', '1111111', 4),
        ('Ana Martínez', '71022222', '2222222', 1),
        ('Luis Fernández', '71033333', '3333333', 5),
        ('Carla Vargas', '71044444', '4444444', 2),
        ('Roberto Sánchez', '71055555', '5555555', 3),
        ('Gabriela Morales', '71066666', '6666666', 4),
        ('Diego Herrera', '71077777', '7777777', 1),
        ('Sofía Ríos', '71088888', '8888888', 5),
        ('Martín Quispe', '71099999', '9999999', 2),
        ('Valentina Paredes', '71100000', '1010101', 3)
      ) AS v(nombres, telefono, ci_nit, segmento_id)
      WHERE NOT EXISTS (SELECT 1 FROM "cliente" c WHERE c."ci_nit" = v.ci_nit);
    `);

    // Preferencias para clientes
    await queryRunner.query(`
      INSERT INTO "preferencias" ("cliente_id", "presupuesto_max", "tipo_propiedad_buscada", "habitaciones_minimo", "zona_preferida")
      SELECT
        (SELECT c."id" FROM "cliente" c WHERE c."ci_nit" = v.ci_nit LIMIT 1),
        v.presupuesto, v.tipo_prop, v.habitaciones, v.zona
      FROM (VALUES
        ('1111111', 250000, 'Casa', 3, 'Urbarí'),
        ('2222222', 500000, 'Casa', 4, 'Equipetrol'),
        ('3333333', 120000, 'Departamento', 2, 'Centro'),
        ('4444444', 700, 'Departamento', 1, 'Centro'),
        ('5555555', 300000, 'Terreno', 0, 'Zona Sur'),
        ('6666666', 200000, 'Casa', 3, 'Urbarí'),
        ('7777777', 400000, 'Casa', 4, 'Equipetrol'),
        ('8888888', 90000, 'Departamento', 2, 'Zona Norte'),
        ('9999999', 600, 'Departamento', 1, 'Centro'),
        ('1010101', 350000, 'Terreno', 0, 'Av. Beni')
      ) AS v(ci_nit, presupuesto, tipo_prop, habitaciones, zona)
      WHERE NOT EXISTS (SELECT 1 FROM "preferencias" p WHERE p."cliente_id" = (SELECT c2."id" FROM "cliente" c2 WHERE c2."ci_nit" = v.ci_nit));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Limpiar preferencias
    await queryRunner.query(`DELETE FROM "preferencias";`);
    // Limpiar clientes
    await queryRunner.query(`DELETE FROM "cliente" WHERE "ci_nit" IN ('1111111','2222222','3333333','4444444','5555555','6666666','7777777','8888888','9999999','1010101');`);
    // Limpiar propiedades
    await queryRunner.query(`DELETE FROM "propiedad";`);
    // Limpiar propietarios
    await queryRunner.query(`DELETE FROM "propietario" WHERE "ci_nit" IN ('1234567','2345678','3456789','4567890');`);
    // Limpiar segmentos
    await queryRunner.query(`DELETE FROM "segmento" WHERE "id" BETWEEN 1 AND 5;`);
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
