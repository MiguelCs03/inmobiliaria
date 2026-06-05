import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SegmentoService } from './repository/segmento.service';
import { SegmentoResolver } from './segmento.resolver';
import { Segmento } from './entities/segmento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Segmento])],
  providers: [SegmentoResolver, SegmentoService],
})
export class SegmentoModule {}
