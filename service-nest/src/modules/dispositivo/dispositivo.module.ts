import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispositivo } from './entities/dispositivo.entity';
import { DispositivoService } from './repository/dispositivo.service';
import { DispositivoResolver } from './dispositivo.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Dispositivo])],
  providers: [DispositivoService, DispositivoResolver],
  exports: [DispositivoService],
})
export class DispositivoModule {}
