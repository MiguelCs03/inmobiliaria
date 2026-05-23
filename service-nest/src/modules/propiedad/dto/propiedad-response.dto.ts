import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Propiedad } from '../entities/propiedad.entity';

@ObjectType()
export class PropiedadResponse extends ApiResponseBase {
  @Field(() => Propiedad, { nullable: true })
  data?: Propiedad | null;
}

@ObjectType()
export class PropiedadListResponse extends ApiResponseBase {
  @Field(() => [Propiedad], { nullable: true })
  data?: Propiedad[] | null;
}
