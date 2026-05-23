import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreatePropiedadInput {
  @Field(() => Int)
  propietarioId!: number;

  @Field(() => Int)
  tipoPropiedadId!: number;

  @Field(() => Int)
  tipoOperacionId!: number;

  @Field(() => Int)
  estadoPropiedadId!: number;

  @Field(() => Float)
  precioBase!: number;

  @Field(() => Float)
  areaM2!: number;

  @Field(() => String, { nullable: true })
  ubicacion?: string;
}
