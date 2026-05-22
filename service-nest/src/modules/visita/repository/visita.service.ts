import { Injectable } from '@nestjs/common';
import { CreateVisitaInput } from '../dto/create-visita.input';
import { UpdateVisitaInput } from '../dto/update-visita.input';

@Injectable()
export class VisitaService {
  create(createVisitaInput: CreateVisitaInput) {
    return 'This action adds a new visita';
  }

  findAll() {
    return `This action returns all visita`;
  }

  findOne(id: number) {
    return `This action returns a #${id} visita`;
  }

  update(id: number, updateVisitaInput: UpdateVisitaInput) {
    return `This action updates a #${id} visita`;
  }

  remove(id: number) {
    return `This action removes a #${id} visita`;
  }
}
