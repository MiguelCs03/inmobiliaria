import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { LoginInput } from '../dto/login.input';
import { RegisterUsuarioInput } from '../dto/register-usuario.input';
import { CambiarContraseniaInput } from '../dto/cambiar-contrasenia.input';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../entities/rol.entity';
import { UsuarioAuthOutput } from '../dto/usuario-auth.output';
import { LoginResponse } from '../dto/login-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  private hashContrasenia(valor: string): string {
    // Hash simple para no guardar texto plano
    return CryptoJS.SHA256(valor).toString();
  }

  private generarToken(usuario: Usuario): string {
    // Token aleatorio basado en tiempo e identidad
    const raw = `${usuario.id}:${Date.now()}:${CryptoJS.lib.WordArray.random(16)}`;
    return CryptoJS.SHA256(raw).toString();
  }

  private toUsuarioOutput(usuario: Usuario): UsuarioAuthOutput {
    return {
      id: usuario.id,
      correo: usuario.correo,
      rolId: usuario.rolId,
      activo: usuario.activo,
    };
  }

  async login(input: LoginInput): Promise<LoginResponse> {
    // Buscar usuario por correo
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: input.correo },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Comparar hash de contrasenia
    const hash = this.hashContrasenia(input.contrasenia);
    if (usuario.contraseniaHash !== hash) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const token = this.generarToken(usuario);
    return {
      token,
      usuario: this.toUsuarioOutput(usuario),
    };
  }

  async register(input: RegisterUsuarioInput): Promise<UsuarioAuthOutput> {
    const existente = await this.usuarioRepository.findOne({
      where: { correo: input.correo },
    });

    if (existente) {
      throw new BadRequestException('El correo ya esta registrado');
    }

    const rol = await this.rolRepository.findOne({ where: { id: input.rolId } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }

    // Crear el usuario con contrasenia hasheada
    const usuario = this.usuarioRepository.create({
      rolId: input.rolId,
      correo: input.correo,
      contraseniaHash: this.hashContrasenia(input.contrasenia),
      activo: input.activo ?? true,
    });

    const creado = await this.usuarioRepository.save(usuario);
    return this.toUsuarioOutput(creado);
  }

  async cambiarContrasenia(input: CambiarContraseniaInput): Promise<UsuarioAuthOutput> {
    // Buscar el usuario por id
    const usuario = await this.usuarioRepository.findOne({ where: { id: input.id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar hash de contrasenia
    usuario.contraseniaHash = this.hashContrasenia(input.nueva);
    const actualizado = await this.usuarioRepository.save(usuario);
    return this.toUsuarioOutput(actualizado);
  }

  async toggleActivoUsuario(id: number): Promise<UsuarioAuthOutput> {
    // Obtener usuario para alternar su estado
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Alternar estado de la cuenta
    usuario.activo = !usuario.activo;
    const actualizado = await this.usuarioRepository.save(usuario);
    return this.toUsuarioOutput(actualizado);
  }

  async usuarios(): Promise<UsuarioAuthOutput[]> {
    const usuarios = await this.usuarioRepository.find();
    return usuarios.map((usuario) => this.toUsuarioOutput(usuario));
  }

  async usuario(id: number): Promise<UsuarioAuthOutput> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.toUsuarioOutput(usuario);
  }
}
