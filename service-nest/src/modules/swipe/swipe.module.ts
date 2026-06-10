import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SwipeService } from './repository/swipe.service';
import { SwipeResolver } from './swipe.resolver';
import { Swipe } from './entities/swipe.entity';
import { Propiedad } from '../propiedad/entities/propiedad.entity';
import { Cliente } from '../cliente/entities/cliente.entity';
import { Preferencias } from '../preferencias/entities/preferencias.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Swipe, Propiedad, Cliente, Preferencias])],
  providers: [SwipeResolver, SwipeService],
})
export class SwipeModule {}
