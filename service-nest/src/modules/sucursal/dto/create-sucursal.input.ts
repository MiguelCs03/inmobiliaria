import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateSucursalInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
