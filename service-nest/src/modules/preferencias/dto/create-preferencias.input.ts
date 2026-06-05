import { InputType, Int, Float, Field } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreatePreferenciasInput {
  @Field(() => Int)
  clienteId!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  presupuestoMax?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  tipoPropiedadBuscada?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  habitacionesMinimo?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  zonaPreferida?: string;
}
