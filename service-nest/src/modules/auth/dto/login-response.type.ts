import { ObjectType, Field } from '@nestjs/graphql';
import { UsuarioAuthOutput } from './usuario-auth.output';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  token!: string;

  @Field(() => UsuarioAuthOutput)
  usuario!: UsuarioAuthOutput;
}
