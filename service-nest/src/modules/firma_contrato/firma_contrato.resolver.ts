import {
  Resolver,
  Mutation,
  Args,
} from '@nestjs/graphql';

import { FirmaContrato } from './entities/firma_contraro.entity';

import { SignContractInput } from './dto/firma_contrato.input';

import { FirmaContratoResponse } from './firma_response.dto';

import { FirmaService } from './repository/firma_contrato.service';

@Resolver(() => FirmaContrato)
export class FirmaResolver {

  constructor(
    private readonly firmaService: FirmaService,
  ) {}

  @Mutation(
    () => FirmaContratoResponse,
  )
  async signContract(

    @Args(
      'signContractInput',
    )
    signContractInput:
      SignContractInput,

  ): Promise<FirmaContratoResponse> {

    const data =
      await this.firmaService
        .signContract(
          signContractInput,
        );

    return {

      success: true,

      message:
        'Firma registrada',

      data,

    };

  }

}