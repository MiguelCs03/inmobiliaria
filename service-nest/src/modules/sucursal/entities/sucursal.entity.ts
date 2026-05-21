import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Sucursal {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
