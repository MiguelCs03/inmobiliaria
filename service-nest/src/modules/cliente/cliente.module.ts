import { Module } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { ClienteResolver } from './cliente.resolver';

@Module({
  providers: [ClienteResolver, ClienteService],
})
export class ClienteModule {}
