import { Injectable } from '@nestjs/common';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';

@Injectable()
export class ClienteService {
  create(createClienteInput: CreateClienteInput) {
    return 'This action adds a new cliente';
  }

  findAll() {
    return `This action returns all cliente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  update(id: number, updateClienteInput: UpdateClienteInput) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
