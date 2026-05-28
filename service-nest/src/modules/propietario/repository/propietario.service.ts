import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePropietarioInput } from '../dto/create-propietario.input';
import { UpdatePropietarioInput } from '../dto/update-propietario.input';
import { Propietario } from '../entities/propietario.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class PropietarioService {
  constructor(
    @InjectRepository(Propietario)
    private readonly propietarioRepository: Repository<Propietario>,
  ) {}

  async create(createPropietarioInput: CreatePropietarioInput): Promise<Propietario> {
    // Evitar duplicados por CI/NIT
    const existente = await this.propietarioRepository.findOne({
      where: { ciNit: createPropietarioInput.ciNit },
    });
    if (existente) {
      throw new BadRequestException('El CI/NIT ya esta registrado');
    }

    // Crear la entidad con los datos recibidos
    const propietario = this.propietarioRepository.create(createPropietarioInput);
    return this.propietarioRepository.save(propietario);
  }

  async findAll(pagination?: PaginationInput): Promise<Propietario[]> {
    if (!pagination) {
      return this.propietarioRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.propietarioRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Propietario> {
    const propietario = await this.propietarioRepository.findOne({ where: { id } });
    if (!propietario) {
      throw new NotFoundException('Propietario no encontrado');
    }
    return propietario;
  }

  async update(id: number, updatePropietarioInput: UpdatePropietarioInput): Promise<Propietario> {
  // 1. Validar primero que el propietario realmente exista (si no existe, lanza NotFoundException)
  await this.findOne(id);
  // 2. Extraer el ID destructurando el objeto para que NO se envíe en los campos a actualizar
  const { id: _, ...datosAActualizar } = updatePropietarioInput;
  // 3. Forzar un UPDATE directo usando el repositorio y el ID del parámetro del resolver
  await this.propietarioRepository.update(id, datosAActualizar);
  // 4. Retornar el registro fresco directo de la base de datos ya modificado
  return this.findOne(id);
 }

  async remove(id: number): Promise<Propietario> {
    // Devolver la entidad eliminada para la respuesta
    const propietario = await this.findOne(id);
    await this.propietarioRepository.remove(propietario);
    return propietario;
  }
}
