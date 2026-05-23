import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateEmpleadoInput {
  @Field(() => Int)
  usuarioId!: number;

  @Field(() => Int)
  sucursalId!: number;

  @Field(() => String)
  nombres!: string;

  @Field(() => String)
  apellidos!: string;
}
