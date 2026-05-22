import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './repository/auth.service';
import { LoginInput } from './dto/login.input';
import { RegisterUsuarioInput } from './dto/register-usuario.input';
import { CambiarContraseniaInput } from './dto/cambiar-contrasenia.input';
import { LoginResponse } from './dto/login-response.type';
import { UsuarioAuthOutput } from './dto/usuario-auth.output';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  login(@Args('loginInput') loginInput: LoginInput): Promise<LoginResponse> {
    // Iniciar sesion con correo y contrasenia
    return this.authService.login(loginInput);
  }

  @Mutation(() => UsuarioAuthOutput)
  register(
    @Args('registerUsuarioInput') registerUsuarioInput: RegisterUsuarioInput,
  ): Promise<UsuarioAuthOutput> {
    // Crear usuario desde un Admin
    return this.authService.register(registerUsuarioInput);
  }

  @Mutation(() => UsuarioAuthOutput)
  cambiarContrasenia(
    @Args('cambiarContraseniaInput') cambiarContraseniaInput: CambiarContraseniaInput,
  ): Promise<UsuarioAuthOutput> {
    // Cambiar la contrasenia del usuario
    return this.authService.cambiarContrasenia(cambiarContraseniaInput);
  }

  @Mutation(() => UsuarioAuthOutput)
  toggleActivoUsuario(@Args('id', { type: () => Int }) id: number): Promise<UsuarioAuthOutput> {
    // Activar o desactivar la cuenta
    return this.authService.toggleActivoUsuario(id);
  }

  @Query(() => [UsuarioAuthOutput], { name: 'usuarios' })
  usuarios(): Promise<UsuarioAuthOutput[]> {
    // Listar todos los usuarios
    return this.authService.usuarios();
  }

  @Query(() => UsuarioAuthOutput, { name: 'usuario' })
  usuario(@Args('id', { type: () => Int }) id: number): Promise<UsuarioAuthOutput> {
    // Obtener usuario por id
    return this.authService.usuario(id);
  }
}
