import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSucursalInput } from '../dto/create-sucursal.input';
import { UpdateSucursalInput } from '../dto/update-sucursal.input';
import { Sucursal } from '../entities/sucursal.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class SucursalService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async create(createSucursalInput: CreateSucursalInput): Promise<Sucursal> {
    // Crear la entidad con los datos recibidos
    const sucursal = this.sucursalRepository.create(createSucursalInput);
    return this.sucursalRepository.save(sucursal);
  }

  async findAll(pagination?: PaginationInput): Promise<Sucursal[]> {
    if (!pagination) {
      return this.sucursalRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.sucursalRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Sucursal> {
    // Buscar por id
    const sucursal = await this.sucursalRepository.findOne({ where: { id } });
    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada');
    }
    return sucursal;
  }

  async update(id: number, updateSucursalInput: UpdateSucursalInput): Promise<Sucursal> {
    // Validar existencia antes de actualizar
    const sucursal = await this.findOne(id);
    Object.assign(sucursal, updateSucursalInput);
    return this.sucursalRepository.save(sucursal);
  }

  async remove(id: number): Promise<Sucursal> {
    // Devolver la entidad eliminada para la respuesta
    const sucursal = await this.findOne(id);
    await this.sucursalRepository.remove(sucursal);
    return sucursal;
  }
}
