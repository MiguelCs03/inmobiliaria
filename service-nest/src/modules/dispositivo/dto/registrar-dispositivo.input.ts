import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class RegistrarDispositivoInput {
  // El usuarioId es opcional para dar soporte a las suscripciones anonimas de clientes
  @Field(() => Int, { nullable: true })
  @IsOptional()
  usuarioId?: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  tokenFcm!: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  plataforma!: string;
}
