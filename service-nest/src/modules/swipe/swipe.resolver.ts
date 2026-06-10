import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SwipeService } from './repository/swipe.service';
import { SwipeResponse } from './dto/swipe-response.dto';
import { PropiedadListResponse } from '../propiedad/dto/propiedad-response.dto';
import { CreateSwipeInput } from './dto/create-swipe.input';

@Resolver()
export class SwipeResolver {
  constructor(private readonly swipeService: SwipeService) {}

  @Query(() => PropiedadListResponse, { name: 'swipeRecomendaciones' })
  async obtenerRecomendaciones(
    @Args('usuarioId', { type: () => Int }) usuarioId: number,
  ): Promise<PropiedadListResponse> {
    try {
      const data = await this.swipeService.obtenerRecomendaciones(usuarioId);
      return { success: true, message: 'Recomendaciones obtenidas', data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al obtener recomendaciones', data: null };
    }
  }

  @Mutation(() => SwipeResponse, { name: 'registrarSwipe' })
  async registrarSwipe(
    @Args('usuarioId', { type: () => Int }) usuarioId: number,
    @Args('input') input: CreateSwipeInput,
  ): Promise<SwipeResponse> {
    try {
      const data = await this.swipeService.registrarSwipe(usuarioId, input);
      return { success: true, message: 'Swipe registrado con éxito', data };
    } catch (error: any) {
      return { success: false, message: error.message || 'Error al registrar swipe', data: null };
    }
  }
}
