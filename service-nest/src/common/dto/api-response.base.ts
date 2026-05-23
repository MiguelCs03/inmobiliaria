import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ApiResponseBase {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  message!: string;
}
