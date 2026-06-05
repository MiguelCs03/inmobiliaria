import { CreateSegmentoInput } from './create-segmento.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateSegmentoInput extends PartialType(CreateSegmentoInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
