import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Propiedad {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
