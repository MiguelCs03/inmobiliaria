import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class CreatePropietarioInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  nombres!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  ciNit!: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  fotoUrl?: string;
}
