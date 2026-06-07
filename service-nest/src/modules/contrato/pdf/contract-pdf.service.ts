import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

import { Injectable } from '@nestjs/common';
import { StorageService } from 'src/common/storage/storage.service';

@Injectable()
export class ContractPdfService {

  constructor(
    private readonly storageService:
      StorageService,
  ) {}


  async generatePdf(
    contrato: any,
  ): Promise<string> {

    const outputDir = path.join(
      process.cwd(),
      'storage',
      'contracts',
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(
        outputDir,
        { recursive: true },
      );
    }

    const fileName =
      `contrato_${contrato.id}.pdf`;

    const filePath = path.join(
      outputDir,
      fileName,
    );

    const doc =
      new PDFDocument();

    const stream =
      fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .fontSize(22)
      .text(
        'CONTRATO INMOBILIARIO',
        {
          align: 'center',
        },
      );

    doc.moveDown();

    doc
      .fontSize(14)
      .text(`ID: ${contrato.id}`);

    doc.text(
      `Titulo: ${contrato.titulo}`,
    );

    doc.text(
      `Monto: ${contrato.montoTotal}`,
    );

    doc.text(
      `Estado: ${contrato.estadoContrato}`,
    );

    doc.moveDown();

    doc.text(
      'Observaciones:',
    );

    doc.text(
      contrato.observaciones ||
      'Sin observaciones',
    );

    doc.moveDown(4);

    doc.text(
      'Firma Cliente',
    );

    doc.text(
      '______________________',
    );

    doc.moveDown(2);

    doc.text(
      'Firma Agente',
    );

    doc.text(
      '______________________',
    );

    doc.end();

    await new Promise<void>(
      (resolve, reject) => {

        stream.on(
          'finish',
          () => resolve(),
        );

        stream.on(
          'error',
          reject,
        );

      },
    );

    return filePath;
  }

  async generateSignedPdf(
    contrato: any,
  ): Promise<string> {

    const outputDir = path.join(
      process.cwd(),
      'storage',
      'contracts',
    );

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(
        outputDir,
        { recursive: true },
      );
    }

    const fileName =
      `contrato_firmado_${contrato.id}.pdf`;

    const filePath = path.join(
      outputDir,
      fileName,
    );

    const doc =
      new PDFDocument();

    const stream =
      fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .fontSize(22)
      .text(
        'CONTRATO INMOBILIARIO FIRMADO',
        {
          align: 'center',
        },
      );

    doc.moveDown();

    doc.text(
      `ID: ${contrato.id}`,
    );

    doc.text(
      `Titulo: ${contrato.titulo}`,
    );

    doc.text(
      `Monto: ${contrato.montoTotal}`,
    );

    doc.text(
      `Estado: ${contrato.estadoContrato}`,
    );

    doc.moveDown();

    doc.text(
      'Observaciones:',
    );

    doc.text(
      contrato.observaciones ||
      'Sin observaciones',
    );

    doc.moveDown(3);

    const cliente =
      contrato.firmas?.find(
        (f: any) =>
          f.tipoFirmante === 'CLIENT',
      );

    doc.text(
      'FIRMA CLIENTE',
    );

    if (cliente) {

      doc.text(
        `Fecha: ${cliente.fechaFirma}`,
      );

      const clienteBuffer =
        await this.storageService
          .downloadFile(
            cliente.signatureUrl,
          );

      const clientePath =
        path.join(
          outputDir,
          `cliente_${contrato.id}.png`,
        );

      fs.writeFileSync(
        clientePath,
        clienteBuffer,
      );

      doc.image(
        clientePath,
        {
          width: 180,
          height: 80,
        },
      );

    }

    doc.moveDown(2);

    const agente =
      contrato.firmas?.find(
        (f: any) =>
          f.tipoFirmante === 'AGENT',
      );

    doc.text(
      'FIRMA AGENTE',
    );

    if (agente) {

      doc.text(
        `Fecha: ${agente.fechaFirma}`,
      );

      const agenteBuffer =
        await this.storageService
          .downloadFile(
            agente.signatureUrl,
          );

      const agentePath =
        path.join(
          outputDir,
          `agente_${contrato.id}.png`,
        );

      fs.writeFileSync(
        agentePath,
        agenteBuffer,
      );

      doc.image(
        agentePath,
        {
          width: 180,
          height: 80,
        },
      );

    }
    doc.end();

    await new Promise<void>(
      (resolve, reject) => {

        stream.on(
          'finish',
          () => resolve(),
        );

        stream.on(
          'error',
          reject,
        );

      },
    );

    return filePath;

  }
}