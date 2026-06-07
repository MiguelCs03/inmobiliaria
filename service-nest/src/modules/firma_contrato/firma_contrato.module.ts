import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmaResolver } from './firma_contrato.resolver';
import { FirmaService } from './repository/firma_contrato.service';
import { FirmaContrato } from './entities/firma_contraro.entity';
import { Contrato } from '../contrato/entities/contrato.entity';
import { StorageModule } from 'src/common/storage/storage.module';

@Module({

  imports: [

    TypeOrmModule.forFeature([
      FirmaContrato,
      Contrato,
    ]),

    StorageModule,

  ],

  providers: [

    FirmaResolver,

    FirmaService,

  ],

})
export class FirmaModule {}
