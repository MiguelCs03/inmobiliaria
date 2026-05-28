import { CreateSucursalInput } from './create-sucursal.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateSucursalInput extends PartialType(CreateSucursalInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
