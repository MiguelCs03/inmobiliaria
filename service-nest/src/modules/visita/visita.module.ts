import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitaService } from './repository/visita.service';
import { VisitaResolver } from './visita.resolver';
import { Visita } from './entities/visita.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Visita])],
  providers: [VisitaResolver, VisitaService],
})
export class VisitaModule {}
