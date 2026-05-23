import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { LoginResponse } from './login-response.type';
import { UsuarioAuthOutput } from './usuario-auth.output';

@ObjectType()
export class LoginApiResponse extends ApiResponseBase {
  @Field(() => LoginResponse, { nullable: true })
  data?: LoginResponse | null;
}

@ObjectType()
export class UsuarioAuthResponse extends ApiResponseBase {
  @Field(() => UsuarioAuthOutput, { nullable: true })
  data?: UsuarioAuthOutput | null;
}

@ObjectType()
export class UsuarioAuthListResponse extends ApiResponseBase {
  @Field(() => [UsuarioAuthOutput], { nullable: true })
  data?: UsuarioAuthOutput[] | null;
}
