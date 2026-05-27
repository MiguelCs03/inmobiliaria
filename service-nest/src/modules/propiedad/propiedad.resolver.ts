import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PropiedadService } from './repository/propiedad.service';
import { Propiedad } from './entities/propiedad.entity';
import { CreatePropiedadInput } from './dto/create-propiedad.input';
import { UpdatePropiedadInput } from './dto/update-propiedad.input';
import { PropiedadListResponse, PropiedadResponse } from './dto/propiedad-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Propiedad)
export class PropiedadResolver {
  constructor(private readonly propiedadService: PropiedadService) {}

  @Mutation(() => PropiedadResponse)
  async createPropiedad(
    @Args('createPropiedadInput') createPropiedadInput: CreatePropiedadInput,
  ): Promise<PropiedadResponse> {
    const data = await this.propiedadService.create(createPropiedadInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => PropiedadListResponse, { name: 'propiedades' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<PropiedadListResponse> {
    const data = await this.propiedadService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => PropiedadResponse, { name: 'propiedad' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<PropiedadResponse> {
    const data = await this.propiedadService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => PropiedadResponse)
  async updatePropiedad(
    @Args('updatePropiedadInput') updatePropiedadInput: UpdatePropiedadInput,
  ): Promise<PropiedadResponse> {
    const data = await this.propiedadService.update(updatePropiedadInput.id, updatePropiedadInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => PropiedadResponse)
  async removePropiedad(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<PropiedadResponse> {
    const data = await this.propiedadService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
