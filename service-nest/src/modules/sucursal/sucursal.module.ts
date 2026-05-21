import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalResolver } from './sucursal.resolver';

@Module({
  providers: [SucursalResolver, SucursalService],
})
export class SucursalModule {}
