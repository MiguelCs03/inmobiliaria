import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolService } from './repository/rol.service';
import { CreateRolInput } from './dto/create-rol.input';
import { RolListResponse, RolResponse } from './dto/rol-response.dto';

@Resolver()
export class RolResolver {
  constructor(private readonly rolService: RolService) {}

  @Mutation(() => RolResponse)
  async createRol(@Args('createRolInput') createRolInput: CreateRolInput): Promise<RolResponse> {
    // Crear un rol nuevo
    const data = await this.rolService.create(createRolInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => RolListResponse, { name: 'roles' })
  async roles(): Promise<RolListResponse> {
    // Listar todos los roles
    const data = await this.rolService.findAll();
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => RolResponse, { name: 'rol' })
  async rol(@Args('id', { type: () => Int }) id: number): Promise<RolResponse> {
    // Buscar rol por id
    const data = await this.rolService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
