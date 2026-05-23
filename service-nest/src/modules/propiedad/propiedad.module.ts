import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropiedadService } from './repository/propiedad.service';
import { PropiedadResolver } from './propiedad.resolver';
import { Propiedad } from './entities/propiedad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propiedad])],
  providers: [PropiedadResolver, PropiedadService],
})
export class PropiedadModule {}
