import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { DispositivoService } from './repository/dispositivo.service';
import { DispositivoResponse } from './dto/dispositivo-response.dto';
import { RegistrarDispositivoInput } from './dto/registrar-dispositivo.input';

@Resolver()
export class DispositivoResolver {
  constructor(private readonly dispositivoService: DispositivoService) {}

  // Mutation GraphQL para registrar o actualizar el token FCM del hardware del cliente o agente
  @Mutation(() => DispositivoResponse)
  async registrarDispositivo(
    @Args('registrarDispositivoInput') input: RegistrarDispositivoInput,
  ): Promise<DispositivoResponse> {
    try {
      const data = await this.dispositivoService.registrar(input);
      return {
        success: true,
        message: 'Dispositivo registrado correctamente.',
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error al registrar dispositivo: ${error.message}`,
        data: null,
      };
    }
  }
}
