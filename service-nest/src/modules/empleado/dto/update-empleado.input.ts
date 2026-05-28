import { CreateEmpleadoInput } from './create-empleado.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateEmpleadoInput extends PartialType(CreateEmpleadoInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
