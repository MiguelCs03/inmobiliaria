import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Contrato } from '../entities/contrato.entity';

@ObjectType()
export class ContratoResponse extends ApiResponseBase {
  @Field(() => Contrato, { nullable: true })
  data?: Contrato | null;
}

@ObjectType()
export class ContratoListResponse extends ApiResponseBase {
  @Field(() => [Contrato], { nullable: true })
  data?: Contrato[] | null;
}
