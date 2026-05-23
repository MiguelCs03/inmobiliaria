import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Visita } from '../entities/visita.entity';

@ObjectType()
export class VisitaResponse extends ApiResponseBase {
  @Field(() => Visita, { nullable: true })
  data?: Visita | null;
}

@ObjectType()
export class VisitaListResponse extends ApiResponseBase {
  @Field(() => [Visita], { nullable: true })
  data?: Visita[] | null;
}
