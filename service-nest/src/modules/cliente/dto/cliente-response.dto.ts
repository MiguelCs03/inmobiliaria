import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Cliente } from '../entities/cliente.entity';

@ObjectType()
export class ClienteResponse extends ApiResponseBase {
  @Field(() => Cliente, { nullable: true })
  data?: Cliente | null;
}

@ObjectType()
export class ClienteListResponse extends ApiResponseBase {
  @Field(() => [Cliente], { nullable: true })
  data?: Cliente[] | null;
}
