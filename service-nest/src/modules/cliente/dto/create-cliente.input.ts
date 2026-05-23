import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateClienteInput {
  @Field(() => Int, { nullable: true })
  usuarioId?: number;

  @Field(() => String)
  nombres!: string;

  @Field(() => String)
  telefono!: string;

  @Field(() => String)
  ciNit!: string;
}
