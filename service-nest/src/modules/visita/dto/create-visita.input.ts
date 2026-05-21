import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVisitaInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
