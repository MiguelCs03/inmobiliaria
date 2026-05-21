import { Injectable } from '@nestjs/common';
import { CreateSucursalInput } from './dto/create-sucursal.input';
import { UpdateSucursalInput } from './dto/update-sucursal.input';

@Injectable()
export class SucursalService {
  create(createSucursalInput: CreateSucursalInput) {
    return 'This action adds a new sucursal';
  }

  findAll() {
    return `This action returns all sucursal`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sucursal`;
  }

  update(id: number, updateSucursalInput: UpdateSucursalInput) {
    return `This action updates a #${id} sucursal`;
  }

  remove(id: number) {
    return `This action removes a #${id} sucursal`;
  }
}
