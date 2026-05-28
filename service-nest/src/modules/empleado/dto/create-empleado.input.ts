import { InputType, Int, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateEmpleadoInput {
  @Field(() => Int)
  usuarioId!: number;

  @Field(() => Int)
  sucursalId!: number;

  @Field(() => String)
  nombres!: string;

  @Field(() => String)
  apellidos!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
