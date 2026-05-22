import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ContratoService } from './repository/contrato.service';
import { Contrato } from './entities/contrato.entity';
import { CreateContratoInput } from './dto/create-contrato.input';
import { UpdateContratoInput } from './dto/update-contrato.input';

@Resolver(() => Contrato)
export class ContratoResolver {
  constructor(private readonly contratoService: ContratoService) {}

  @Mutation(() => Contrato)
  createContrato(@Args('createContratoInput') createContratoInput: CreateContratoInput) {
    return this.contratoService.create(createContratoInput);
  }

  @Query(() => [Contrato], { name: 'contrato' })
  findAll() {
    return this.contratoService.findAll();
  }

  @Query(() => Contrato, { name: 'contrato' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.contratoService.findOne(id);
  }

  @Mutation(() => Contrato)
  updateContrato(@Args('updateContratoInput') updateContratoInput: UpdateContratoInput) {
    return this.contratoService.update(updateContratoInput.id, updateContratoInput);
  }

  @Mutation(() => Contrato)
  removeContrato(@Args('id', { type: () => Int }) id: number) {
    return this.contratoService.remove(id);
  }
}
