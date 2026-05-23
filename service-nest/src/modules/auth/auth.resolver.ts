import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './repository/auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterUsuarioInput } from './dto/register-usuario.input';
import { CambiarContraseniaInput } from './dto/cambiar-contrasenia.input';
import {
  LoginApiResponse,
  UsuarioAuthListResponse,
  UsuarioAuthResponse,
} from './dto/auth-response.dto';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginApiResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<LoginApiResponse> {
    // Iniciar sesion con correo y contrasenia
    const data = await this.authService.login(loginInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => UsuarioAuthResponse)
  register(
    @Args('registerUsuarioInput') registerUsuarioInput: RegisterUsuarioInput,
  ): Promise<UsuarioAuthResponse> {
    // Crear usuario desde un Admin
    return this.authService
      .register(registerUsuarioInput)
      .then((data) => ({ success: true, data, message: 'Operacion exitosa' }));
  }

  @Mutation(() => UsuarioAuthResponse)
  cambiarContrasenia(
    @Args('cambiarContraseniaInput') cambiarContraseniaInput: CambiarContraseniaInput,
  ): Promise<UsuarioAuthResponse> {
    // Cambiar la contrasenia del usuario
    return this.authService
      .cambiarContrasenia(cambiarContraseniaInput)
      .then((data) => ({ success: true, data, message: 'Operacion exitosa' }));
  }

  @Mutation(() => UsuarioAuthResponse)
  toggleActivoUsuario(@Args('id', { type: () => Int }) id: number): Promise<UsuarioAuthResponse> {
    // Activar o desactivar la cuenta
    return this.authService
      .toggleActivoUsuario(id)
      .then((data) => ({ success: true, data, message: 'Operacion exitosa' }));
  }

  @Query(() => UsuarioAuthListResponse, { name: 'usuarios' })
  async usuarios(): Promise<UsuarioAuthListResponse> {
    // Listar todos los usuarios
    const data = await this.authService.usuarios();
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => UsuarioAuthResponse, { name: 'usuario' })
  async usuario(@Args('id', { type: () => Int }) id: number): Promise<UsuarioAuthResponse> {
    // Obtener usuario por id
    const data = await this.authService.usuario(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }
}
