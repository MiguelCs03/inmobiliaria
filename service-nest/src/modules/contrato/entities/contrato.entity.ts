import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Contrato {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
