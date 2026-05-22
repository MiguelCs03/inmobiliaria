import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CambiarContraseniaInput {
  @Field(() => Int)
  id!: number;

  @Field(() => String)
  nueva!: string;
}
