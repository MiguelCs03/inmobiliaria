import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Empleado {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
