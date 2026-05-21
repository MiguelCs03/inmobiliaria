import { Module } from '@nestjs/common';
import { PropiedadService } from './propiedad.service';
import { PropiedadResolver } from './propiedad.resolver';

@Module({
  providers: [PropiedadResolver, PropiedadService],
})
export class PropiedadModule {}
