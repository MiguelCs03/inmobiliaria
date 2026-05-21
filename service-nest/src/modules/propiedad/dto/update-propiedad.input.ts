import { CreatePropiedadInput } from './create-propiedad.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePropiedadInput extends PartialType(CreatePropiedadInput) {
  @Field(() => Int)
  id: number;
}
