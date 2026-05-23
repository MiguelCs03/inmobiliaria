import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreatePropietarioInput {
  @Field(() => String)
  nombres!: string;

  @Field(() => String)
  telefono!: string;

  @Field(() => String)
  ciNit!: string;
}
