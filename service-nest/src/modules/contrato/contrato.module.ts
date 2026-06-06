import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './repository/contrato.service';
import { ContratoResolver } from './contrato.resolver';
import { Contrato } from './entities/contrato.entity';
import { ContractPdfService } from './pdf/contract-pdf.service';
import { StorageService } from 'src/common/storage/storage.service';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato]), StorageModule],
  providers: [ContratoResolver, ContratoService, ContractPdfService,StorageService],
})
export class ContratoModule {}
