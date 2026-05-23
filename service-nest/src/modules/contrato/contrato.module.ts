import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratoService } from './repository/contrato.service';
import { ContratoResolver } from './contrato.resolver';
import { Contrato } from './entities/contrato.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contrato])],
  providers: [ContratoResolver, ContratoService],
})
export class ContratoModule {}
