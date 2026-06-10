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
import { SegmentoModule } from './modules/segmento/segmento.module';
import { PreferenciasModule } from './modules/preferencias/preferencias.module';
import { SucursalModule } from './modules/sucursal/sucursal.module';
import { VisitaModule } from './modules/visita/visita.module';
import { UploadModule } from './modules/upload/upload.module';
import { FirmaModule } from './modules/firma_contrato/firma_contrato.module';
import { DispositivoModule } from './modules/dispositivo/dispositivo.module';
import { SwipeModule } from './modules/swipe/swipe.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';

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
    SegmentoModule,
    PreferenciasModule,
    EmpleadoModule,
    PropiedadModule,
    PropietarioModule,
    SucursalModule,
    VisitaModule,
    UploadModule,
    FirmaModule,
    DispositivoModule,
    SwipeModule,
    NotificacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
