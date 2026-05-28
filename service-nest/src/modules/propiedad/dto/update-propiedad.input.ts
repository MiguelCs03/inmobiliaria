import { CreatePropiedadInput } from './create-propiedad.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdatePropiedadInput extends PartialType(CreatePropiedadInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
