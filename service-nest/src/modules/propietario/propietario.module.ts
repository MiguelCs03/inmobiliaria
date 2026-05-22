import { Module } from '@nestjs/common';
import { PropietarioService } from './repository/propietario.service';
import { PropietarioResolver } from './propietario.resolver';

@Module({
  providers: [PropietarioResolver, PropietarioService],
})
export class PropietarioModule {}
