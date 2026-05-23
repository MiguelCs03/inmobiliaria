import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql';

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
}
