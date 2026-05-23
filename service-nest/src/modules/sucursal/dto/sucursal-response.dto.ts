import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Sucursal } from '../entities/sucursal.entity';

@ObjectType()
export class SucursalResponse extends ApiResponseBase {
  @Field(() => Sucursal, { nullable: true })
  data?: Sucursal | null;
}

@ObjectType()
export class SucursalListResponse extends ApiResponseBase {
  @Field(() => [Sucursal], { nullable: true })
  data?: Sucursal[] | null;
}
