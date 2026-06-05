import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenciasService } from './repository/preferencias.service';
import { PreferenciasResolver } from './preferencias.resolver';
import { Preferencias } from './entities/preferencias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Preferencias])],
  providers: [PreferenciasResolver, PreferenciasService],
})
export class PreferenciasModule {}
