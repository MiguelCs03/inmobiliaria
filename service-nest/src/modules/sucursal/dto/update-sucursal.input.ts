import { CreateSucursalInput } from './create-sucursal.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateSucursalInput extends PartialType(CreateSucursalInput) {
  @Field(() => Int)
  id: number;
}
