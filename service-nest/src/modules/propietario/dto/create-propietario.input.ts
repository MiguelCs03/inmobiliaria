import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

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
}
