import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PropietarioService } from './repository/propietario.service';
import { Propietario } from './entities/propietario.entity';
import { CreatePropietarioInput } from './dto/create-propietario.input';
import { UpdatePropietarioInput } from './dto/update-propietario.input';
import { PropietarioListResponse, PropietarioResponse } from './dto/propietario-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Propietario)
export class PropietarioResolver {
  constructor(private readonly propietarioService: PropietarioService) {}

  @Mutation(() => PropietarioResponse)
  async createPropietario(
    @Args('createPropietarioInput') createPropietarioInput: CreatePropietarioInput,
  ): Promise<PropietarioResponse> {
    const data = await this.propietarioService.create(createPropietarioInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => PropietarioListResponse, { name: 'propietario' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<PropietarioListResponse> {
    const data = await this.propietarioService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => PropietarioResponse, { name: 'propietario' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<PropietarioResponse> {
    const data = await this.propietarioService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => PropietarioResponse)
  async updatePropietario(
    @Args('updatePropietarioInput') updatePropietarioInput: UpdatePropietarioInput,
  ): Promise<PropietarioResponse> {
    const data = await this.propietarioService.update(updatePropietarioInput.id, updatePropietarioInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => PropietarioResponse)
  async removePropietario(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PropietarioResponse> {
    const data = await this.propietarioService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
