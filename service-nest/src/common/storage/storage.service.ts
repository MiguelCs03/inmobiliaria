import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import * as fs from 'fs';

@Injectable()
export class StorageService {

  private readonly s3: S3Client;

  constructor() {

    this.s3 = new S3Client({
      region: process.env.AWS_REGION,

      credentials: {
        accessKeyId:
          process.env.AWS_ACCESS_KEY_ID!,

        secretAccessKey:
          process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

  }

  async uploadPdf(
    filePath: string,
    fileName: string,
  ): Promise<string> {

    const fileBuffer =
      fs.readFileSync(filePath);

    await this.s3.send(
      new PutObjectCommand({

        Bucket:
          process.env.AWS_S3_BUCKET,

        Key:
          `contracts/${fileName}`,

        Body:
          fileBuffer,

        ContentType:
          'application/pdf',

      }),
    );

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/contracts/${fileName}`;
  }

  //estp es para las firmas las imagenes donde se guardaran
  async uploadSignature(
    signatureBase64: string,
    fileName: string,
  ): Promise<string> {
    
    const cleanBase64 =
      signatureBase64.replace(
        /^data:image\/\w+;base64,/,
        '',
      );
    const buffer =
      Buffer.from(
        cleanBase64,
        'base64',
      );

    await this.s3.send(

      new PutObjectCommand({

        Bucket:
          process.env.AWS_S3_BUCKET,

        Key:
          `signatures/${fileName}`,

        Body:
          buffer,

        ContentType:
          'image/png',

      }),

    );

    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/signatures/${fileName}`;

  }

  //aqui es para obener el pdf con permisos de aws s3
  async downloadPdf(
    pdfUrl: string,
  ): Promise<Buffer> {

    const key =
      pdfUrl.split('.amazonaws.com/')[1];

    const response =
      await this.s3.send(

        new GetObjectCommand({

          Bucket:
            process.env.AWS_S3_BUCKET,

          Key:
            key,

        }),

      );

    const chunks: Uint8Array[] = [];

    for await (
      const chunk of response.Body as any
    ) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }

  //esto es para el frontend, una url temporal
  async getPresignedUrl(
    pdfUrl: string,
  ): Promise<string> {

    const key =
      pdfUrl.split(
        '.amazonaws.com/'
      )[1];

    const command =
      new GetObjectCommand({

        Bucket:
          process.env.AWS_S3_BUCKET,

        Key:
          key,

      });

    return await getSignedUrl(

      this.s3,

      command,

      {
        expiresIn: 3600,
      },

    );

  }
}