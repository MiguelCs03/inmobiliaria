import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropiedadInput } from '../dto/create-propiedad.input';
import { UpdatePropiedadInput } from '../dto/update-propiedad.input';
import { Propiedad } from '../entities/propiedad.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class PropiedadService {
  constructor(
    @InjectRepository(Propiedad)
    private readonly propiedadRepository: Repository<Propiedad>,
  ) {}

  async create(createPropiedadInput: CreatePropiedadInput): Promise<Propiedad> {
    // Crear la entidad con los datos recibidos
    const propiedad = this.propiedadRepository.create(createPropiedadInput);
    return this.propiedadRepository.save(propiedad);
  }

  async findAll(pagination?: PaginationInput): Promise<Propiedad[]> {
    if (!pagination) {
      return this.propiedadRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.propiedadRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Propiedad> {
    const propiedad = await this.propiedadRepository.findOne({ where: { id } });
    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }
    return propiedad;
  }

  async update(id: number, updatePropiedadInput: UpdatePropiedadInput): Promise<Propiedad> {
    // Validar existencia antes de actualizar
    const propiedad = await this.findOne(id);
    Object.assign(propiedad, updatePropiedadInput);
    return this.propiedadRepository.save(propiedad);
  }

  async remove(id: number): Promise<Propiedad> {
    // Devolver la entidad eliminada para la respuesta
    const propiedad = await this.findOne(id);
    await this.propiedadRepository.remove(propiedad);
    return propiedad;
  }
}
