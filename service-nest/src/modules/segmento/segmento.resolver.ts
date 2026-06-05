import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SegmentoService } from './repository/segmento.service';
import { Segmento } from './entities/segmento.entity';
import { CreateSegmentoInput } from './dto/create-segmento.input';
import { UpdateSegmentoInput } from './dto/update-segmento.input';

@Resolver(() => Segmento)
export class SegmentoResolver {
  constructor(private readonly segmentoService: SegmentoService) {}

  @Mutation(() => Segmento)
  async createSegmento(
    @Args('createSegmentoInput') createSegmentoInput: CreateSegmentoInput,
  ): Promise<Segmento> {
    return this.segmentoService.create(createSegmentoInput);
  }

  @Query(() => [Segmento], { name: 'segmentos' })
  async findAll(): Promise<Segmento[]> {
    return this.segmentoService.findAll();
  }

  @Query(() => Segmento, { name: 'segmento' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Segmento> {
    return this.segmentoService.findOne(id);
  }

  @Mutation(() => Segmento)
  async updateSegmento(
    @Args('updateSegmentoInput') updateSegmentoInput: UpdateSegmentoInput,
  ): Promise<Segmento> {
    return this.segmentoService.update(updateSegmentoInput.id, updateSegmentoInput);
  }

  @Mutation(() => Segmento)
  async removeSegmento(@Args('id', { type: () => Int }) id: number): Promise<Segmento> {
    return this.segmentoService.remove(id);
  }
}
