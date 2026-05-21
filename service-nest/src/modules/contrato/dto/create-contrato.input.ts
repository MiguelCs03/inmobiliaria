import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateContratoInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
