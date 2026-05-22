import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { ContratoModule } from './modules/contrato/contrato.module';
import { EmpleadoModule } from './modules/empleado/empleado.module';
import { PropiedadModule } from './modules/propiedad/propiedad.module';
import { PropietarioModule } from './modules/propietario/propietario.module';
import { SucursalModule } from './modules/sucursal/sucursal.module';
import { VisitaModule } from './modules/visita/visita.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Apollo Sandbox local para documentar queries y mutations
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    AuthModule,
    ClienteModule,
    ContratoModule,
    EmpleadoModule,
    PropiedadModule,
    PropietarioModule,
    SucursalModule,
    VisitaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
