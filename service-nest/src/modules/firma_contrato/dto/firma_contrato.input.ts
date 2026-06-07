import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsString,
  IsNotEmpty,
} from 'class-validator';

@InputType()
export class SignContractInput {

  @Field(() => Int)
  @IsInt()
  contractId!: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  signerType!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  signatureBase64!: string;
}