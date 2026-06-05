import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePreferenciasInput } from '../dto/create-preferencias.input';
import { UpdatePreferenciasInput } from '../dto/update-preferencias.input';
import { Preferencias } from '../entities/preferencias.entity';

@Injectable()
export class PreferenciasService {
  constructor(
    @InjectRepository(Preferencias)
    private readonly preferenciasRepository: Repository<Preferencias>,
  ) {}

  async create(createPreferenciasInput: CreatePreferenciasInput): Promise<Preferencias> {
    const preferencias = this.preferenciasRepository.create(createPreferenciasInput);
    return this.preferenciasRepository.save(preferencias);
  }

  async findAll(): Promise<Preferencias[]> {
    return this.preferenciasRepository.find();
  }

  async findOne(id: number): Promise<Preferencias> {
    const preferencias = await this.preferenciasRepository.findOne({ where: { id } });
    if (!preferencias) {
      throw new NotFoundException('Preferencias no encontradas');
    }
    return preferencias;
  }

  async findByCliente(clienteId: number): Promise<Preferencias[]> {
    return this.preferenciasRepository.find({ where: { clienteId } });
  }

  async update(id: number, updatePreferenciasInput: UpdatePreferenciasInput): Promise<Preferencias> {
    const preferencias = await this.findOne(id);
    Object.assign(preferencias, updatePreferenciasInput);
    return this.preferenciasRepository.save(preferencias);
  }

  async remove(id: number): Promise<Preferencias> {
    const preferencias = await this.findOne(id);
    await this.preferenciasRepository.remove(preferencias);
    return preferencias;
  }
}
