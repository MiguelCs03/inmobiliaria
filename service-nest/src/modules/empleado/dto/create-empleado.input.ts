import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateEmpleadoInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
