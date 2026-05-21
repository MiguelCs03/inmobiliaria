import { CreateVisitaInput } from './create-visita.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateVisitaInput extends PartialType(CreateVisitaInput) {
  @Field(() => Int)
  id: number;
}
