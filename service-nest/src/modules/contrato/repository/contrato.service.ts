import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContratoInput } from '../dto/create-contrato.input';
import { UpdateContratoInput } from '../dto/update-contrato.input';
import { Contrato } from '../entities/contrato.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class ContratoService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
  ) {}

  async create(createContratoInput: CreateContratoInput): Promise<Contrato> {
    // Crear la entidad con los datos recibidos
    const contrato = this.contratoRepository.create(createContratoInput);
    return this.contratoRepository.save(contrato);
  }

  async findAll(pagination?: PaginationInput): Promise<Contrato[]> {
    if (!pagination) {
      return this.contratoRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.contratoRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOne({ where: { id } });
    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }
    return contrato;
  }

  async update(id: number, updateContratoInput: UpdateContratoInput): Promise<Contrato> {
    // Validar existencia antes de actualizar
    const contrato = await this.findOne(id);
    Object.assign(contrato, updateContratoInput);
    return this.contratoRepository.save(contrato);
  }

  async remove(id: number): Promise<Contrato> {
    // Devolver la entidad eliminada para la respuesta
    const contrato = await this.findOne(id);
    await this.contratoRepository.remove(contrato);
    return contrato;
  }
}
