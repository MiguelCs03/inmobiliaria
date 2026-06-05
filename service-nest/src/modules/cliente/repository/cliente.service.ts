import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClienteInput } from '../dto/create-cliente.input';
import { UpdateClienteInput } from '../dto/update-cliente.input';
import { Cliente } from '../entities/cliente.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';

@Injectable()
export class ClienteService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteInput: CreateClienteInput): Promise<Cliente> {
    // Crear la entidad con los datos recibidos
    const cliente = this.clienteRepository.create(createClienteInput);
    return this.clienteRepository.save(cliente);
  }

  async findAll(pagination?: PaginationInput): Promise<Cliente[]> {
    const options: any = { relations: ['segmento', 'preferencias'] };
    if (pagination) {
      const page = pagination.page ?? 1;
      const limit = pagination.limit ?? 10;
      options.skip = (page - 1) * limit;
      options.take = limit;
    }
    return this.clienteRepository.find(options);
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id },
      relations: ['segmento', 'preferencias'],
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: number, updateClienteInput: UpdateClienteInput): Promise<Cliente> {
    // Validar existencia antes de actualizar
    const cliente = await this.findOne(id);
    Object.assign(cliente, updateClienteInput);
    return this.clienteRepository.save(cliente);
  }

  async remove(id: number): Promise<Cliente> {
    // Devolver la entidad eliminada para la respuesta
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
    return cliente;
  }
}
