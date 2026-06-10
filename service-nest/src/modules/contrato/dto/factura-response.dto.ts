import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Factura } from '../entities/factura.entity';

@ObjectType()
export class FacturaResponse extends ApiResponseBase {
  @Field(() => Factura, { nullable: true })
  data?: Factura | null;
}

@ObjectType()
export class FacturaListResponse extends ApiResponseBase {
  @Field(() => [Factura], { nullable: true })
  data?: Factura[] | null;
}
