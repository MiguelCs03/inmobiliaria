import { Injectable } from '@nestjs/common';
import { CreatePropietarioInput } from './dto/create-propietario.input';
import { UpdatePropietarioInput } from './dto/update-propietario.input';

@Injectable()
export class PropietarioService {
  create(createPropietarioInput: CreatePropietarioInput) {
    return 'This action adds a new propietario';
  }

  findAll() {
    return `This action returns all propietario`;
  }

  findOne(id: number) {
    return `This action returns a #${id} propietario`;
  }

  update(id: number, updatePropietarioInput: UpdatePropietarioInput) {
    return `This action updates a #${id} propietario`;
  }

  remove(id: number) {
    return `This action removes a #${id} propietario`;
  }
}
