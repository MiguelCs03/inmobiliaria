import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropietarioService } from './repository/propietario.service';
import { PropietarioResolver } from './propietario.resolver';
import { Propietario } from './entities/propietario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Propietario])],
  providers: [PropietarioResolver, PropietarioService],
})
export class PropietarioModule {}
