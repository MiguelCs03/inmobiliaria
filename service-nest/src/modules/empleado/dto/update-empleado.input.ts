import { CreateEmpleadoInput } from './create-empleado.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEmpleadoInput extends PartialType(CreateEmpleadoInput) {
  @Field(() => Int)
  id: number;
}
