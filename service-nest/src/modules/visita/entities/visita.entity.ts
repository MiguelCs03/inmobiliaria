import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Visita {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
