import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropiedadService } from './repository/propiedad.service';
import { PropiedadResolver } from './propiedad.resolver';
import { Propiedad } from './entities/propiedad.entity';
import { PropiedadImagen } from './entities/propiedad-imgen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propiedad, PropiedadImagen])],
  providers: [PropiedadResolver, PropiedadService],
})
export class PropiedadModule {}
