import { Injectable } from '@nestjs/common';
import { CreateContratoInput } from '../dto/create-contrato.input';
import { UpdateContratoInput } from '../dto/update-contrato.input';

@Injectable()
export class ContratoService {
  create(createContratoInput: CreateContratoInput) {
    return 'This action adds a new contrato';
  }

  findAll() {
    return `This action returns all contrato`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contrato`;
  }

  update(id: number, updateContratoInput: UpdateContratoInput) {
    return `This action updates a #${id} contrato`;
  }

  remove(id: number) {
    return `This action removes a #${id} contrato`;
  }
}
