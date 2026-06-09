import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsNotEmpty, IsDate } from 'class-validator';

@InputType()
export class CreateVisitaInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  propiedadId!: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  clienteId!: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  empleadoId!: number;

  @Field(() => GraphQLISODateTime)
  @IsDate()
  @IsNotEmpty()
  fechaVisita!: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  estado?: string;
}
