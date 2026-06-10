import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { VisitaService } from './repository/visita.service';
import { Visita } from './entities/visita.entity';
import { CreateVisitaInput } from './dto/create-visita.input';
import { UpdateVisitaInput } from './dto/update-visita.input';
import { VisitaListResponse, VisitaResponse } from './dto/visita-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';
import { StripePaymentIntentResponse } from './dto/stripe-payment-intent.dto';

@Resolver(() => Visita)
export class VisitaResolver {
  constructor(private readonly visitaService: VisitaService) {}

  @Mutation(() => VisitaResponse)
  async createVisita(
    @Args('createVisitaInput') createVisitaInput: CreateVisitaInput,
  ): Promise<VisitaResponse> {
    const data = await this.visitaService.create(createVisitaInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => VisitaListResponse, { name: 'visitas' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<VisitaListResponse> {
    const data = await this.visitaService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => VisitaResponse, { name: 'visita' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<VisitaResponse> {
    const data = await this.visitaService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => VisitaResponse)
  async updateVisita(
    @Args('updateVisitaInput') updateVisitaInput: UpdateVisitaInput,
  ): Promise<VisitaResponse> {
    const data = await this.visitaService.update(updateVisitaInput.id, updateVisitaInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => VisitaResponse)
  async removeVisita(@Args('id', { type: () => Int }) id: number): Promise<VisitaResponse> {
    const data = await this.visitaService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => StripePaymentIntentResponse)
  async crearStripePaymentIntent(
    @Args('monto', { type: () => Float }) monto: number,
  ): Promise<StripePaymentIntentResponse> {
    return this.visitaService.crearStripePaymentIntent(monto);
  }
}
