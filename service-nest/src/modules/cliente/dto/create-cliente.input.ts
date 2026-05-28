import { InputType, Int, Field } from '@nestjs/graphql';
import { IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreateClienteInput {
  @Field(() => Int, { nullable: true })
  usuarioId?: number;

  @Field(() => String)
  nombres!: string;

  @Field(() => String)
  telefono!: string;

  @Field(() => String)
  ciNit!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
