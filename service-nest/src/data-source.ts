import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carga tu archivo .env local

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  // OJO: Asegúrate de que en tu .env estas variables existan (con MASTER)
  host: process.env.DB_MASTER_HOST, 
  port: parseInt(process.env.DB_MASTER_PORT || '5432', 10),
  username: process.env.DB_MASTER_USER ,
  password: process.env.DB_MASTER_PASS , 
  database: process.env.DB_MASTER_NAME ,
  entities: [isProduction ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;