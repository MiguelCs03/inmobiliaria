import {
  Field,
  ObjectType,
} from '@nestjs/graphql';

import { FirmaContrato } from './entities/firma_contraro.entity';
@ObjectType()
export class FirmaContratoResponse {

  @Field()
  success!: boolean;

  @Field()
  message!: string;

  @Field(
    () => FirmaContrato,
    {
      nullable: true,
    },
  )
  data?: FirmaContrato;

}