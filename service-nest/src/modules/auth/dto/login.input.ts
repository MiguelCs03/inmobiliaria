import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  correo!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  contrasenia!: string;
}
