import { Module } from '@nestjs/common';
import { VisitaService } from './repository/visita.service';
import { VisitaResolver } from './visita.resolver';

@Module({
  providers: [VisitaResolver, VisitaService],
})
export class VisitaModule {}
