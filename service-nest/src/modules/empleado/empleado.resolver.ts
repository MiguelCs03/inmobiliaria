import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EmpleadoService } from './repository/empleado.service';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoInput } from './dto/create-empleado.input';
import { UpdateEmpleadoInput } from './dto/update-empleado.input';
import { EmpleadoListResponse, EmpleadoResponse } from './dto/empleado-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Empleado)
export class EmpleadoResolver {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Mutation(() => EmpleadoResponse)
  async createEmpleado(
    @Args('createEmpleadoInput') createEmpleadoInput: CreateEmpleadoInput,
  ): Promise<EmpleadoResponse> {
    const data = await this.empleadoService.create(createEmpleadoInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => EmpleadoListResponse, { name: 'empleado' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<EmpleadoListResponse> {
    const data = await this.empleadoService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => EmpleadoResponse, { name: 'empleado' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<EmpleadoResponse> {
    const data = await this.empleadoService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => EmpleadoResponse)
  async updateEmpleado(
    @Args('updateEmpleadoInput') updateEmpleadoInput: UpdateEmpleadoInput,
  ): Promise<EmpleadoResponse> {
    const data = await this.empleadoService.update(updateEmpleadoInput.id, updateEmpleadoInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => EmpleadoResponse)
  async removeEmpleado(@Args('id', { type: () => Int }) id: number): Promise<EmpleadoResponse> {
    const data = await this.empleadoService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
