import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field(() => String)
  correo!: string;

  @Field(() => String)
  contrasenia!: string;
}
