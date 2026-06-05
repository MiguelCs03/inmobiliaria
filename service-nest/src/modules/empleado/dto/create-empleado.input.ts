import { InputType, Int, Field } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateEmpleadoInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  usuarioId!: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  sucursalId!: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  nombres!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  apellidos!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
