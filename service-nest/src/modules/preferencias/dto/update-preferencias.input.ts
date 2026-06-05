import { CreatePreferenciasInput } from './create-preferencias.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdatePreferenciasInput extends PartialType(CreatePreferenciasInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
