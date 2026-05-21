import { Module } from '@nestjs/common';
import { PropietarioService } from './propietario.service';
import { PropietarioResolver } from './propietario.resolver';

@Module({
  providers: [PropietarioResolver, PropietarioService],
})
export class PropietarioModule {}
