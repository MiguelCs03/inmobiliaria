import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePropiedadInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
