import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UsuarioAuthOutput {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  correo!: string;

  @Field(() => Int)
  rolId!: number;

  @Field(() => Boolean)
  activo!: boolean;
}
