import { CreateVisitaInput } from './create-visita.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateVisitaInput extends PartialType(CreateVisitaInput) {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;
}
