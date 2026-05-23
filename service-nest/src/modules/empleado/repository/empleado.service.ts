import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmpleadoInput } from '../dto/create-empleado.input';
import { UpdateEmpleadoInput } from '../dto/update-empleado.input';
import { Empleado } from '../entities/empleado.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
  ) {}

  async create(createEmpleadoInput: CreateEmpleadoInput): Promise<Empleado> {
    // Crear la entidad con los datos recibidos
    const empleado = this.empleadoRepository.create(createEmpleadoInput);
    return this.empleadoRepository.save(empleado);
  }

  async findAll(pagination?: PaginationInput): Promise<Empleado[]> {
    if (!pagination) {
      return this.empleadoRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.empleadoRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({ where: { id } });
    if (!empleado) {
      throw new NotFoundException('Empleado no encontrado');
    }
    return empleado;
  }

  async update(id: number, updateEmpleadoInput: UpdateEmpleadoInput): Promise<Empleado> {
    // Validar existencia antes de actualizar
    const empleado = await this.findOne(id);
    Object.assign(empleado, updateEmpleadoInput);
    return this.empleadoRepository.save(empleado);
  }

  async remove(id: number): Promise<Empleado> {
    // Devolver la entidad eliminada para la respuesta
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
    return empleado;
  }
}
