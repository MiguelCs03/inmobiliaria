import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateVisitaInput {
  @Field(() => Int)
  propiedadId!: number;

  @Field(() => Int)
  clienteId!: number;

  @Field(() => Int)
  empleadoId!: number;

  @Field(() => GraphQLISODateTime)
  fechaVisita!: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  estado?: string;
}
