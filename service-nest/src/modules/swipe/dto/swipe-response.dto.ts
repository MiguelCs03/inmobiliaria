import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Swipe } from '../entities/swipe.entity';

@ObjectType()
export class SwipeResponse extends ApiResponseBase {
  @Field(() => Swipe, { nullable: true })
  data?: Swipe | null;
}
