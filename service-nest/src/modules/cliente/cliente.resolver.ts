import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClienteService } from './cliente.service';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';

@Resolver(() => Cliente)
export class ClienteResolver {
  constructor(private readonly clienteService: ClienteService) {}

  @Mutation(() => Cliente)
  createCliente(@Args('createClienteInput') createClienteInput: CreateClienteInput) {
    return this.clienteService.create(createClienteInput);
  }

  @Query(() => [Cliente], { name: 'cliente' })
  findAll() {
    return this.clienteService.findAll();
  }

  @Query(() => Cliente, { name: 'cliente' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.clienteService.findOne(id);
  }

  @Mutation(() => Cliente)
  updateCliente(@Args('updateClienteInput') updateClienteInput: UpdateClienteInput) {
    return this.clienteService.update(updateClienteInput.id, updateClienteInput);
  }

  @Mutation(() => Cliente)
  removeCliente(@Args('id', { type: () => Int }) id: number) {
    return this.clienteService.remove(id);
  }
}
