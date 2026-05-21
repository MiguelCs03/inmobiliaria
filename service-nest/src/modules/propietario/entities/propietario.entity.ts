import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Propietario {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
