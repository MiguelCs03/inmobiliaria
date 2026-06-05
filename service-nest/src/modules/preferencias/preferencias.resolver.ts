import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PreferenciasService } from './repository/preferencias.service';
import { Preferencias } from './entities/preferencias.entity';
import { CreatePreferenciasInput } from './dto/create-preferencias.input';
import { UpdatePreferenciasInput } from './dto/update-preferencias.input';

@Resolver(() => Preferencias)
export class PreferenciasResolver {
  constructor(private readonly preferenciasService: PreferenciasService) {}

  @Mutation(() => Preferencias)
  async createPreferencias(
    @Args('createPreferenciasInput') createPreferenciasInput: CreatePreferenciasInput,
  ): Promise<Preferencias> {
    return this.preferenciasService.create(createPreferenciasInput);
  }

  @Query(() => [Preferencias], { name: 'preferencias' })
  async findAll(): Promise<Preferencias[]> {
    return this.preferenciasService.findAll();
  }

  @Query(() => Preferencias, { name: 'preferencia' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Preferencias> {
    return this.preferenciasService.findOne(id);
  }

  @Query(() => [Preferencias], { name: 'preferenciasByCliente' })
  async findByCliente(@Args('clienteId', { type: () => Int }) clienteId: number): Promise<Preferencias[]> {
    return this.preferenciasService.findByCliente(clienteId);
  }

  @Mutation(() => Preferencias)
  async updatePreferencias(
    @Args('updatePreferenciasInput') updatePreferenciasInput: UpdatePreferenciasInput,
  ): Promise<Preferencias> {
    return this.preferenciasService.update(updatePreferenciasInput.id, updatePreferenciasInput);
  }

  @Mutation(() => Preferencias)
  async removePreferencias(@Args('id', { type: () => Int }) id: number): Promise<Preferencias> {
    return this.preferenciasService.remove(id);
  }
}
