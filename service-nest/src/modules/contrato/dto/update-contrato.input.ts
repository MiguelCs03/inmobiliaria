import { CreateContratoInput } from './create-contrato.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateContratoInput extends PartialType(CreateContratoInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
