import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ContratoService } from './repository/contrato.service';
import { Contrato } from './entities/contrato.entity';
import { CreateContratoInput } from './dto/create-contrato.input';
import { UpdateContratoInput } from './dto/update-contrato.input';
import { ContratoListResponse, ContratoResponse } from './dto/contrato-response.dto';
import { PaginationInput } from '../../common/dto/pagination.input';

@Resolver(() => Contrato)
export class ContratoResolver {
  constructor(private readonly contratoService: ContratoService) { }

  @Mutation(() => ContratoResponse)
  async createContrato(
    @Args('createContratoInput') createContratoInput: CreateContratoInput,
  ): Promise<ContratoResponse> {
    const data = await this.contratoService.create(createContratoInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => ContratoListResponse, { name: 'contratos' })
  async findAll(
    @Args('pagination', { type: () => PaginationInput, nullable: true })
    pagination?: PaginationInput,
  ): Promise<ContratoListResponse> {
    const data = await this.contratoService.findAll(pagination);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Query(() => ContratoResponse, { name: 'contrato' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<ContratoResponse> {
    const data = await this.contratoService.findOne(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => ContratoResponse)
  async updateContrato(
    @Args('updateContratoInput') updateContratoInput: UpdateContratoInput,
  ): Promise<ContratoResponse> {
    const data = await this.contratoService.update(updateContratoInput.id, updateContratoInput);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  @Mutation(() => ContratoResponse)
  async removeContrato(@Args('id', { type: () => Int }) id: number): Promise<ContratoResponse> {
    const data = await this.contratoService.remove(id);
    return { success: true, data, message: 'Operacion exitosa' };
  }

  //sin blockchain, solo prueba
  @Mutation(() => ContratoResponse)
  async generateContractPdf(@Args('id', { type: () => Int })
  id: number,): Promise<ContratoResponse> {
    const data =
      await this.contratoService
        .generatePdf(id);
    return {
      success: true,
      data,
      message:
        'PDF generado correctamente',
    };

  }
  //con blockchain, s3
  @Mutation(
    () => ContratoResponse
  )
  async registerBlockchain(
    @Args(
      'id',
      { type: () => Int }
    )
    id: number,
  ): Promise<ContratoResponse> {

    const data =
      await this.contratoService
        .registerBlockchain(id);

    return {

      success: true,

      message:
        'Contrato registrado en blockchain',

      data,

    };

  }

  //captura el pdf
  @Query(
    () => String
  )
  async contratoPdfUrl(

    @Args(
      'id',
      {
        type: () => Int
      }
    )
    id: number,

  ): Promise<string> {

    return this.contratoService
      .getPdfUrl(id);

  }

  @Mutation(
    () => ContratoResponse,
  )
  async generateSignedPdf(

    @Args(
      'id',
      { type: () => Int },
    )
    id: number,

  ): Promise<ContratoResponse> {

    const data =
      await this.contratoService
        .generateSignedPdf(
          id,
        );

    return {

      success: true,

      message:
        'PDF firmado generado',

      data,

    };

  }
}
