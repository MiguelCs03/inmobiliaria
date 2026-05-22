import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class RegisterUsuarioInput {
  @Field(() => Int)
  adminId!: number;

  @Field(() => Int)
  rolId!: number;

  @Field(() => String)
  correo!: string;

  @Field(() => String)
  contrasenia!: string;

  @Field(() => Boolean, { nullable: true })
  activo?: boolean;
}
