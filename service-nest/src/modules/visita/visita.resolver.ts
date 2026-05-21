import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VisitaService } from './visita.service';
import { Visita } from './entities/visita.entity';
import { CreateVisitaInput } from './dto/create-visita.input';
import { UpdateVisitaInput } from './dto/update-visita.input';

@Resolver(() => Visita)
export class VisitaResolver {
  constructor(private readonly visitaService: VisitaService) {}

  @Mutation(() => Visita)
  createVisita(@Args('createVisitaInput') createVisitaInput: CreateVisitaInput) {
    return this.visitaService.create(createVisitaInput);
  }

  @Query(() => [Visita], { name: 'visita' })
  findAll() {
    return this.visitaService.findAll();
  }

  @Query(() => Visita, { name: 'visita' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.visitaService.findOne(id);
  }

  @Mutation(() => Visita)
  updateVisita(@Args('updateVisitaInput') updateVisitaInput: UpdateVisitaInput) {
    return this.visitaService.update(updateVisitaInput.id, updateVisitaInput);
  }

  @Mutation(() => Visita)
  removeVisita(@Args('id', { type: () => Int }) id: number) {
    return this.visitaService.remove(id);
  }
}
