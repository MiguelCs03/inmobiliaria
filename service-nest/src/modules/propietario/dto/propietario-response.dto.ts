import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Propietario } from '../entities/propietario.entity';

@ObjectType()
export class PropietarioResponse extends ApiResponseBase {
  @Field(() => Propietario, { nullable: true })
  data?: Propietario | null;
}

@ObjectType()
export class PropietarioListResponse extends ApiResponseBase {
  @Field(() => [Propietario], { nullable: true })
  data?: Propietario[] | null;
}
