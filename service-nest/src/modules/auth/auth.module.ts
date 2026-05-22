import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './repository/auth.service';
import { AuthResolver } from './auth.resolver';
import { Usuario } from './entities/usuario.entity';
import { Rol } from './entities/rol.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Usuario, Rol])],
	providers: [AuthResolver, AuthService],
})
export class AuthModule {}
