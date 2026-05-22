import { Injectable } from '@nestjs/common';
import { CreatePropiedadInput } from '../dto/create-propiedad.input';
import { UpdatePropiedadInput } from '../dto/update-propiedad.input';

@Injectable()
export class PropiedadService {
  create(createPropiedadInput: CreatePropiedadInput) {
    return 'This action adds a new propiedad';
  }

  findAll() {
    return `This action returns all propiedad`;
  }

  findOne(id: number) {
    return `This action returns a #${id} propiedad`;
  }

  update(id: number, updatePropiedadInput: UpdatePropiedadInput) {
    return `This action updates a #${id} propiedad`;
  }

  remove(id: number) {
    return `This action removes a #${id} propiedad`;
  }
}
