import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoService } from './repository/empleado.service';
import { EmpleadoResolver } from './empleado.resolver';
import { Empleado } from './entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
  providers: [EmpleadoResolver, EmpleadoService],
})
export class EmpleadoModule {}
