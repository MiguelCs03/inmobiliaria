import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './repository/contrato.service';
import { ContratoResolver } from './contrato.resolver';
import { Contrato } from './entities/contrato.entity';
import { PlanPago } from './entities/plan-pago.entity';
import { Factura } from './entities/factura.entity';
import { Pago } from './entities/pago.entity';
import { ContractPdfService } from './pdf/contract-pdf.service';
import { StorageService } from 'src/common/storage/storage.service';
import { StorageModule } from '../../common/storage/storage.module';
import { SiatService } from './repository/siat.service';
import { PagoService } from './repository/pago.service';
import { PagoResolver } from './pago.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contrato, PlanPago, Factura, Pago]),
    StorageModule,
  ],
  providers: [
    ContratoResolver,
    ContratoService,
    ContractPdfService,
    StorageService,
    SiatService,
    PagoService,
    PagoResolver,
  ],
})
export class ContratoModule {}

