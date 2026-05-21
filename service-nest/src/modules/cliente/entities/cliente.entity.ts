import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Cliente {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
