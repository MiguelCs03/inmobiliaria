import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClienteService } from './repository/cliente.service';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteInput } from './dto/create-cliente.input';
import { UpdateClienteInput } from './dto/update-cliente.input';
import { ClienteListResponse, ClienteResponse } from './dto/cliente-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Cliente)
export class ClienteResolver {
  constructor(private readonly clienteService: ClienteService) {}

  @Mutation(() => ClienteResponse)
  async createCliente(
    @Args('createClienteInput') createClienteInput: CreateClienteInput,
  ): Promise<ClienteResponse> {
    const data = await this.clienteService.create(createClienteInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => ClienteListResponse, { name: 'clientes' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<ClienteListResponse> {
    const data = await this.clienteService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => ClienteResponse, { name: 'cliente' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<ClienteResponse> {
    const data = await this.clienteService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => ClienteResponse)
  async updateCliente(
    @Args('updateClienteInput') updateClienteInput: UpdateClienteInput,
  ): Promise<ClienteResponse> {
    const data = await this.clienteService.update(updateClienteInput.id, updateClienteInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => ClienteResponse)
  async removeCliente(@Args('id', { type: () => Int }) id: number): Promise<ClienteResponse> {
    const data = await this.clienteService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
