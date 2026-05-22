import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SucursalService } from './repository/sucursal.service';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursalInput } from './dto/create-sucursal.input';
import { UpdateSucursalInput } from './dto/update-sucursal.input';

@Resolver(() => Sucursal)
export class SucursalResolver {
  constructor(private readonly sucursalService: SucursalService) {}

  @Mutation(() => Sucursal)
  createSucursal(@Args('createSucursalInput') createSucursalInput: CreateSucursalInput) {
    // Crear una nueva sucursal
    return this.sucursalService.create(createSucursalInput);
  }

  @Query(() => [Sucursal], { name: 'sucursales' })
  findAll() {
    // Listar sucursales
    return this.sucursalService.findAll();
  }

  @Query(() => Sucursal, { name: 'sucursal' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    // Buscar sucursal por id
    return this.sucursalService.findOne(id);
  }

  @Mutation(() => Sucursal)
  updateSucursal(@Args('updateSucursalInput') updateSucursalInput: UpdateSucursalInput) {
    // Actualizar datos de una sucursal
    return this.sucursalService.update(updateSucursalInput.id, updateSucursalInput);
  }

  @Mutation(() => Sucursal)
  removeSucursal(@Args('id', { type: () => Int }) id: number) {
    // Eliminar sucursal
    return this.sucursalService.remove(id);
  }
}
