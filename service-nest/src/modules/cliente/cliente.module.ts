import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteService } from './repository/cliente.service';
import { ClienteResolver } from './cliente.resolver';
import { Cliente } from './entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  providers: [ClienteResolver, ClienteService],
})
export class ClienteModule {}
