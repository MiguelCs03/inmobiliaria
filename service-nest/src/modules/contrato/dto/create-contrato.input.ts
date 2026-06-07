import {
  InputType,
  Int,
  Field,
  Float
} from '@nestjs/graphql';

import {
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString
} from 'class-validator';

@InputType()
export class CreateContratoInput {

  @Field(() => String)
  @IsString()
  titulo!: string;

  @Field(() => Int)
  @IsInt()
  propiedadId!: number;

  @Field(() => Int)
  @IsInt()
  clienteId!: number;

  @Field(() => Int)
  @IsInt()
  empleadoId!: number;

  @Field(() => Float)
  @IsNumber()
  montoTotal!: number;

  @Field(() => String, {
    nullable: true
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @Field(() => Date, {
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: Date;

  @Field(() => Date, {
    nullable: true
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: Date;

  @Field(() => String, {
    nullable: true
  })
  @IsOptional()
  @IsString()
  estadoContrato?: string;

  @Field(() => String, {
    nullable: true
  })
  @IsOptional()
  @IsString()
  documentoNosqlId?: string;
}