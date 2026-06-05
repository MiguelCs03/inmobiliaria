import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSegmentoInput } from '../dto/create-segmento.input';
import { UpdateSegmentoInput } from '../dto/update-segmento.input';
import { Segmento } from '../entities/segmento.entity';

@Injectable()
export class SegmentoService {
  constructor(
    @InjectRepository(Segmento)
    private readonly segmentoRepository: Repository<Segmento>,
  ) {}

  async create(createSegmentoInput: CreateSegmentoInput): Promise<Segmento> {
    const segmento = this.segmentoRepository.create(createSegmentoInput);
    return this.segmentoRepository.save(segmento);
  }

  async findAll(): Promise<Segmento[]> {
    return this.segmentoRepository.find();
  }

  async findOne(id: number): Promise<Segmento> {
    const segmento = await this.segmentoRepository.findOne({ where: { id } });
    if (!segmento) {
      throw new NotFoundException('Segmento no encontrado');
    }
    return segmento;
  }

  async update(id: number, updateSegmentoInput: UpdateSegmentoInput): Promise<Segmento> {
    const segmento = await this.findOne(id);
    Object.assign(segmento, updateSegmentoInput);
    return this.segmentoRepository.save(segmento);
  }

  async remove(id: number): Promise<Segmento> {
    const segmento = await this.findOne(id);
    await this.segmentoRepository.remove(segmento);
    return segmento;
  }
}
