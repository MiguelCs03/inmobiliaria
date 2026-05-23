import { InputType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class RegisterUsuarioInput {
  @Field(() => Int)
  @IsInt()
  rolId!: number;

  @Field(() => String)
  @IsEmail()
  correo!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  contrasenia!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
