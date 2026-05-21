import { CreateContratoInput } from './create-contrato.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateContratoInput extends PartialType(CreateContratoInput) {
  @Field(() => Int)
  id: number;
}
