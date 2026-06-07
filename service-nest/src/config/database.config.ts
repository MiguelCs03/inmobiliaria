import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const toPort = (value: string | undefined, fallback: number): number => {
	const parsed = Number(value ?? fallback);
	return Number.isNaN(parsed) ? fallback : parsed;
};

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
	// En produccion (Neon), usa DATABASE_URL directo
	const databaseUrl = configService.get<string>('DATABASE_URL');
	if (databaseUrl) {
		return {
			type: 'postgres',
			url: databaseUrl,
			ssl: { rejectUnauthorized: false },
			entities: [__dirname + '/../**/*.entity{.ts,.js}'],
			synchronize: false,
			dropSchema: false,
			logging: false,
		};
	}

	// En desarrollo, usa replicacion master/slave
	return {
		type: 'postgres',
		replication: {
			master: {
				host: configService.get<string>('DB_MASTER_HOST') ?? 'localhost',
				port: toPort(configService.get<string>('DB_MASTER_PORT'), 5432),
				username: configService.get<string>('DB_MASTER_USER') ?? 'postgres',
				password: configService.get<string>('DB_MASTER_PASS') ?? 'postgres',
				database: configService.get<string>('DB_MASTER_NAME') ?? 'inmobiliaria',
			},
			slaves: [
				{
					host: configService.get<string>('DB_SLAVE_HOST') ?? 'localhost',
					port: toPort(configService.get<string>('DB_SLAVE_PORT'), 5432),
					username: configService.get<string>('DB_SLAVE_USER') ?? 'postgres',
					password: configService.get<string>('DB_SLAVE_PASS') ?? 'postgres',
					database: configService.get<string>('DB_SLAVE_NAME') ?? 'inmobiliaria',
				},
			],
		},
		entities: [__dirname + '/../**/*.entity{.ts,.js}'],
		synchronize: false,
		dropSchema: false,
		logging: false,
	};
};
