import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class StripePaymentIntentResponse {
  @Field(() => Boolean)
  success!: boolean;

  @Field(() => String)
  message!: string;

  @Field(() => String, { nullable: true })
  clientSecret?: string;
}
