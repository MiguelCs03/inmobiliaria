import { Field, ObjectType } from '@nestjs/graphql';
import { ApiResponseBase } from '../../../common/dto/api-response.base';
import { Empleado } from '../entities/empleado.entity';

@ObjectType()
export class EmpleadoResponse extends ApiResponseBase {
  @Field(() => Empleado, { nullable: true })
  data?: Empleado | null;
}

@ObjectType()
export class EmpleadoListResponse extends ApiResponseBase {
  @Field(() => [Empleado], { nullable: true })
  data?: Empleado[] | null;
}
