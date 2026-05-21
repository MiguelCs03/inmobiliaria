import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { EmpleadoService } from './empleado.service';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoInput } from './dto/create-empleado.input';
import { UpdateEmpleadoInput } from './dto/update-empleado.input';

@Resolver(() => Empleado)
export class EmpleadoResolver {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Mutation(() => Empleado)
  createEmpleado(@Args('createEmpleadoInput') createEmpleadoInput: CreateEmpleadoInput) {
    return this.empleadoService.create(createEmpleadoInput);
  }

  @Query(() => [Empleado], { name: 'empleado' })
  findAll() {
    return this.empleadoService.findAll();
  }

  @Query(() => Empleado, { name: 'empleado' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.empleadoService.findOne(id);
  }

  @Mutation(() => Empleado)
  updateEmpleado(@Args('updateEmpleadoInput') updateEmpleadoInput: UpdateEmpleadoInput) {
    return this.empleadoService.update(updateEmpleadoInput.id, updateEmpleadoInput);
  }

  @Mutation(() => Empleado)
  removeEmpleado(@Args('id', { type: () => Int }) id: number) {
    return this.empleadoService.remove(id);
  }
}
