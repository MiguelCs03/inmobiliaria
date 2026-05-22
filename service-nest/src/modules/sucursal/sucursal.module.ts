import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalService } from './repository/sucursal.service';
import { SucursalResolver } from './sucursal.resolver';
import { Sucursal } from './entities/sucursal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sucursal])],
  providers: [SucursalResolver, SucursalService],
})
export class SucursalModule {}
