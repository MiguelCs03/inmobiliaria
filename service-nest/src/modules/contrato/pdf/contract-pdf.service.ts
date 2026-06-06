import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';

import { Injectable } from '@nestjs/common';

@Injectable()
export class ContractPdfService {

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
}