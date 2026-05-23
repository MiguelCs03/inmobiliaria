import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SucursalService } from './repository/sucursal.service';
import { Sucursal } from './entities/sucursal.entity';
import { CreateSucursalInput } from './dto/create-sucursal.input';
import { UpdateSucursalInput } from './dto/update-sucursal.input';
import { SucursalListResponse, SucursalResponse } from './dto/sucursal-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Sucursal)
export class SucursalResolver {
  constructor(private readonly sucursalService: SucursalService) {}

  @Mutation(() => SucursalResponse)
  async createSucursal(
    @Args('createSucursalInput') createSucursalInput: CreateSucursalInput,
  ): Promise<SucursalResponse> {
    // Crear una nueva sucursal
    const data = await this.sucursalService.create(createSucursalInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => SucursalListResponse, { name: 'sucursales' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<SucursalListResponse> {
    // Listar sucursales
    const data = await this.sucursalService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => SucursalResponse, { name: 'sucursal' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<SucursalResponse> {
    // Buscar sucursal por id
    const data = await this.sucursalService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => SucursalResponse)
  async updateSucursal(
    @Args('updateSucursalInput') updateSucursalInput: UpdateSucursalInput,
  ): Promise<SucursalResponse> {
    // Actualizar datos de una sucursal
    const data = await this.sucursalService.update(updateSucursalInput.id, updateSucursalInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => SucursalResponse)
  async removeSucursal(@Args('id', { type: () => Int }) id: number): Promise<SucursalResponse> {
    // Eliminar sucursal
    const data = await this.sucursalService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
