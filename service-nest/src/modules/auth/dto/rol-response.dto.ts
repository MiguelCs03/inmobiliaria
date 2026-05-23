import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Rol } from '../entities/rol.entity';

@ObjectType()
export class RolResponse extends ApiResponseBase {
  @Field(() => Rol, { nullable: true })
  data?: Rol | null;
}

@ObjectType()
export class RolListResponse extends ApiResponseBase {
  @Field(() => [Rol], { nullable: true })
  data?: Rol[] | null;
}
