import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateRolInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  nombre!: string;
}
