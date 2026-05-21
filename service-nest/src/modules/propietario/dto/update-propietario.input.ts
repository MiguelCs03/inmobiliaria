import { CreatePropietarioInput } from './create-propietario.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePropietarioInput extends PartialType(CreatePropietarioInput) {
  @Field(() => Int)
  id: number;
}
