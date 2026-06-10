import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContratoInput } from '../dto/create-contrato.input';
import { UpdateContratoInput } from '../dto/update-contrato.input';
import { Contrato } from '../entities/contrato.entity';
import { PlanPago, PlanPagoEstado } from '../entities/plan-pago.entity';
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
    @InjectRepository(PlanPago)
    private readonly planPagoRepository: Repository<PlanPago>,
    private readonly contractPdfService: ContractPdfService,
    private readonly storageService: StorageService,
  ) { }


  async create(
    createContratoInput: CreateContratoInput
  ): Promise<Contrato> {
    const contrato = this.contratoRepository.create({
      ...createContratoInput,
      estadoContrato: createContratoInput.estadoContrato ?? 'DRAFT'
    });

    const savedContrato = await this.contratoRepository.save(contrato);

    // Generación de plan de pagos por defecto: se divide el monto total del contrato en 3 cuotas
    const totalMonto = Number(savedContrato.montoTotal);
    const numCuotas = 3;
    const montoCuota = Number((totalMonto / numCuotas).toFixed(2));
    
    for (let i = 1; i <= numCuotas; i++) {
      // Se ajusta la última cuota para evitar problemas de centavos por redondeos
      const montoFinal = i === numCuotas 
        ? Number((totalMonto - (montoCuota * (numCuotas - 1))).toFixed(2))
        : montoCuota;

      const cuota = this.planPagoRepository.create({
        contratoId: savedContrato.id,
        nroCuota: i,
        montoCuota: montoFinal,
        estado: PlanPagoEstado.Pendiente
      });
      await this.planPagoRepository.save(cuota);
    }

    return savedContrato;
  }

  async findAll(pagination?: PaginationInput): Promise<Contrato[]> {
    if (!pagination) {
      return this.contratoRepository.find({
        relations: ['planPagos', 'planPagos.facturas', 'cliente']
      });
    }

    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const skip = (page - 1) * limit;
    return this.contratoRepository.find({ 
      skip, 
      take: limit,
      relations: ['planPagos', 'planPagos.facturas', 'cliente']
    });
  }

  async findOne(id: number): Promise<Contrato> {
    let contrato = await this.contratoRepository.findOne({
      where: { id },
      relations: ['firmas', 'planPagos', 'planPagos.facturas', 'cliente'],
    });

    if (!contrato) {
      throw new NotFoundException('Contrato no encontrado');
    }

    // Si el contrato no tiene cuotas (como los creados anteriormente), las generamos al vuelo
    if (!contrato.planPagos || contrato.planPagos.length === 0) {
      const totalMonto = Number(contrato.montoTotal);
      const numCuotas = 3;
      const montoCuota = Number((totalMonto / numCuotas).toFixed(2));
      
      for (let i = 1; i <= numCuotas; i++) {
        // Se ajusta la última cuota para evitar problemas de centavos por redondeos
        const montoFinal = i === numCuotas 
          ? Number((totalMonto - (montoCuota * (numCuotas - 1))).toFixed(2))
          : montoCuota;

        const cuota = this.planPagoRepository.create({
          contratoId: contrato.id,
          nroCuota: i,
          montoCuota: montoFinal,
          estado: PlanPagoEstado.Pendiente,
        });
        await this.planPagoRepository.save(cuota);
      }

      // Volvemos a consultar el contrato para retornar el objeto con las cuotas recién generadas
      contrato = await this.contratoRepository.findOne({
        where: { id },
        relations: ['firmas', 'planPagos', 'planPagos.facturas', 'cliente'],
      });
    }

    return contrato!;
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

  async generateSignedPdf(
  id: number,
): Promise<Contrato> {

  const contrato =
    await this.contratoRepository.findOne({

      where: {
        id,
      },

      relations: [
        'firmas',
      ],

    });

  if (!contrato) {
    throw new NotFoundException(
      'Contrato no encontrado',
    );
  }

  const pdfPath =
    await this.contractPdfService
      .generateSignedPdf(
        contrato,
      );

  const pdfUrl =
    await this.storageService
      .uploadPdf(
        pdfPath,
        `contrato_firmado_${contrato.id}.pdf`,
      );

  contrato.pdfUrl =
    pdfUrl;

  return await this.contratoRepository.save(
    contrato,
  );

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
    const goUrl = process.env.GO_SERVICE_URL || 'http://host.docker.internal:3030';
    const response =
      await axios.post(
        `${goUrl}/contracts`,
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