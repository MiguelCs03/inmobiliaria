import {
  InputType,
  Int,
  Field,
  Float
} from '@nestjs/graphql';

@InputType()
export class CreateContratoInput {

  @Field(() => String)
  titulo!: string;

  @Field(() => Int)
  propiedadId!: number;

  @Field(() => Int)
  clienteId!: number;

  @Field(() => Int)
  empleadoId!: number;

  @Field(() => Float)
  montoTotal!: number;

  @Field(() => String, {
    nullable: true
  })
  observaciones?: string;

  @Field(() => Date, {
    nullable: true
  })
  fechaInicio?: Date;

  @Field(() => Date, {
    nullable: true
  })
  fechaFin?: Date;

  @Field(() => String, {
    nullable: true
  })
  estadoContrato?: string;

  @Field(() => String, {
    nullable: true
  })
  documentoNosqlId?: string;

}