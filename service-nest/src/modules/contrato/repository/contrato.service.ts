import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContratoInput } from '../dto/create-contrato.input';
import { UpdateContratoInput } from '../dto/update-contrato.input';
import { Contrato } from '../entities/contrato.entity';
import { PaginationInput } from '../../../common/dto/pagination.input';
import { ContractPdfService } from '../pdf/contract-pdf.service';
import { StorageService } from 'src/common/storage/storage.service';
import axios from 'axios';
import { GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ContratoService {
  constructor(
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    private readonly contractPdfService: ContractPdfService,
    private readonly storageService: StorageService,
  ) { }

  async create(
    createContratoInput:
      CreateContratoInput
  ): Promise<Contrato> {

    const contrato =
      this.contratoRepository.create({
        ...createContratoInput,

        estadoContrato:
          createContratoInput
            .estadoContrato ??
          'DRAFT'
      });

    return this.contratoRepository.save(
      contrato
    );

  }

  async findAll(pagination?: PaginationInput): Promise<Contrato[]> {
    if (!pagination) {
      return this.contratoRepository.find();
    }

    // Aplicar paginacion simple cuando se envia
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.contratoRepository.find({ skip, take: limit });
  }

  async findOne(id: number): Promise<Contrato> {
    const contrato = await this.contratoRepository.findOne({ where: { id } });
    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }
    return contrato;
  }

  async update(id: number, updateContratoInput: UpdateContratoInput): Promise<Contrato> {
    // Validar existencia antes de actualizar
    const contrato = await this.findOne(id);
    Object.assign(contrato, updateContratoInput);
    return this.contratoRepository.save(contrato);
  }

  async remove(id: number): Promise<Contrato> {
    // Devolver la entidad eliminada para la respuesta
    const contrato = await this.findOne(id);
    await this.contratoRepository.remove(contrato);
    return contrato;
  }

  //Servicio para generar el pdf del contrato

  async generatePdf(
    id: number,
  ) {

    const contrato =
      await this.findOne(id);

    const pdfPath =
      await this.contractPdfService
        .generatePdf(
          contrato
        );

    const pdfUrl =
      await this.storageService
        .uploadPdf(
          pdfPath,
          `contrato_${contrato.id}.pdf`
        );

    contrato.pdfUrl =
      pdfUrl;

    await this.contratoRepository
      .save(contrato);

    return contrato;
  }

  async registerBlockchain(
    id: number,
  ): Promise<Contrato> {

    const contrato =
      await this.findOne(id);

    if (!contrato.pdfUrl) {
      throw new Error(
        'El contrato no tiene PDF generado'
      );
    }

    // Descargar PDF desde S3
    const pdfBuffer =
      await this.storageService
        .downloadPdf(
          contrato.pdfUrl,
        );

    // Convertir a Base64
    const pdfBase64 =
      pdfBuffer.toString('base64');

    // Enviar a GO
    const response =
      await axios.post(
        'http://host.docker.internal:3030/contracts',
        {
          title:
            contrato.titulo,

          pdf_base64:
            pdfBase64,
        },
      );

    contrato.documentHash =
      response.data.document_hash;

    contrato.blockchainContractId =
      response.data.contract_id;

    contrato.estadoContrato =
      response.data.status;

    return await this.contratoRepository.save(
      contrato,
    );
  }

  async getPdfUrl(
    id: number,
  ): Promise<string> {

    const contrato =
      await this.findOne(id);

    if (!contrato.pdfUrl) {

      throw new Error(
        'Contrato sin PDF'
      );

    }

    return this.storageService
      .getPresignedUrl(
        contrato.pdfUrl
      );

  }
}