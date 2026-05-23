import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVisitaInput } from '../dto/create-visita.input';
import { UpdateVisitaInput } from '../dto/update-visita.input';
import { Visita } from '../entities/visita.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class VisitaService {
  constructor(
    @InjectRepository(Visita)
    private readonly visitaRepository: Repository<Visita>,
  ) {}

  async create(createVisitaInput: CreateVisitaInput): Promise<Visita> {
    // Crear la entidad con los datos recibidos
    const visita = this.visitaRepository.create(createVisitaInput);
    return this.visitaRepository.save(visita);
  }

  async findAll(pagination?: PaginationInput): Promise<Visita[]> {
    if (!pagination) {
      return this.visitaRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.visitaRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Visita> {
    const visita = await this.visitaRepository.findOne({ where: { id } });
    if (!visita) {
      throw new NotFoundException('Visita no encontrada');
    }
    return visita;
  }

  async update(id: number, updateVisitaInput: UpdateVisitaInput): Promise<Visita> {
    // Validar existencia antes de actualizar
    const visita = await this.findOne(id);
    Object.assign(visita, updateVisitaInput);
    return this.visitaRepository.save(visita);
  }

  async remove(id: number): Promise<Visita> {
    // Devolver la entidad eliminada para la respuesta
    const visita = await this.findOne(id);
    await this.visitaRepository.remove(visita);
    return visita;
  }
}
