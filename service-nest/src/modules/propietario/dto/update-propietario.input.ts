import { CreatePropietarioInput } from './create-propietario.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdatePropietarioInput extends PartialType(CreatePropietarioInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
