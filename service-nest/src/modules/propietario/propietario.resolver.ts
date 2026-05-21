import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PropietarioService } from './propietario.service';
import { Propietario } from './entities/propietario.entity';
import { CreatePropietarioInput } from './dto/create-propietario.input';
import { UpdatePropietarioInput } from './dto/update-propietario.input';

@Resolver(() => Propietario)
export class PropietarioResolver {
  constructor(private readonly propietarioService: PropietarioService) {}

  @Mutation(() => Propietario)
  createPropietario(@Args('createPropietarioInput') createPropietarioInput: CreatePropietarioInput) {
    return this.propietarioService.create(createPropietarioInput);
  }

  @Query(() => [Propietario], { name: 'propietario' })
  findAll() {
    return this.propietarioService.findAll();
  }

  @Query(() => Propietario, { name: 'propietario' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.propietarioService.findOne(id);
  }

  @Mutation(() => Propietario)
  updatePropietario(@Args('updatePropietarioInput') updatePropietarioInput: UpdatePropietarioInput) {
    return this.propietarioService.update(updatePropietarioInput.id, updatePropietarioInput);
  }

  @Mutation(() => Propietario)
  removePropietario(@Args('id', { type: () => Int }) id: number) {
    return this.propietarioService.remove(id);
  }
}
