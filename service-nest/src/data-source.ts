import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga tu archivo .env

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

let dataSourceOptions: DataSourceOptions;

if (databaseUrl) {
  // Configuración para Producción (Neon Tech)
  dataSourceOptions = {
    type: 'postgres',
    url: databaseUrl,
    ssl: { rejectUnauthorized: false }, // Obligatorio para Neon
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
    logging: true,
  };
} else {
  // Configuración para Desarrollo Local
  dataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_MASTER_HOST || 'localhost',
    port: parseInt(process.env.DB_MASTER_PORT || '5432', 10),
    username: process.env.DB_MASTER_USER || 'postgres',
    password: process.env.DB_MASTER_PASS || 'postgres',
    database: process.env.DB_MASTER_NAME || 'inmobiliaria',
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: true,
  };
}

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;