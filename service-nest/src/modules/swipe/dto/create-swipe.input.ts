import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsBoolean } from 'class-validator';

@InputType()
export class CreateSwipeInput {
  @Field(() => Int)
  @IsInt()
  propiedadId!: number;

  @Field(() => Boolean)
  @IsBoolean()
  like!: boolean;
}
