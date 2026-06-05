import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateSegmentoInput {
  @Field(() => String)
  nombre!: string;
}
