import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePropiedadInput {
  @Field(() => Int)
  @IsInt()
  propietarioId!: number;

  @Field(() => Int)
  @IsInt()
  tipoPropiedadId!: number;

  @Field(() => Int)
  @IsInt()
  tipoOperacionId!: number;

  @Field(() => Int)
  @IsInt()
  estadoPropiedadId!: number;

  @Field(() => Float)
  @IsNumber()
  precioBase!: number;

  @Field(() => Float)
  @IsNumber()
  areaM2!: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  imagenesUrls?: string[];
}
