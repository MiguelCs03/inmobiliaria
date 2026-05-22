import { Module } from '@nestjs/common';
import { ContratoService } from './repository/contrato.service';
import { ContratoResolver } from './contrato.resolver';

@Module({
  providers: [ContratoResolver, ContratoService],
})
export class ContratoModule {}
