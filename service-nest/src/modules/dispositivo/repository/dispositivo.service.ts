import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispositivo } from '../entities/dispositivo.entity';
import { RegistrarDispositivoInput } from '../dto/registrar-dispositivo.input';

@Injectable()
export class DispositivoService {
  constructor(
    @InjectRepository(Dispositivo)
    private readonly dispositivoRepository: Repository<Dispositivo>,
  ) {}

  // Registra un nuevo token FCM o actualiza la vinculacion con el usuario
  async registrar(input: RegistrarDispositivoInput): Promise<Dispositivo> {
    const { tokenFcm, usuarioId, plataforma } = input;

    // Busca si este dispositivo/token fisico ya habia sido registrado previamente
    let dispositivo = await this.dispositivoRepository.findOne({ where: { tokenFcm } });

    if (dispositivo) {
      // Si ya existia, se actualiza el id del usuario asignado y la plataforma si cambio
      dispositivo.usuarioId = usuarioId || null;
      dispositivo.plataforma = plataforma;
      dispositivo.fechaRegistro = new Date();
    } else {
      // Si es un nuevo dispositivo fisico, se crea un registro desde cero
      dispositivo = this.dispositivoRepository.create({
        tokenFcm,
        usuarioId: usuarioId || null,
        plataforma,
      });
    }

    return this.dispositivoRepository.save(dispositivo);
  }
}
