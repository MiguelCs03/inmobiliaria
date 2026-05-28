import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class UploadService {
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME') || '';
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY') || '';
    this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET') || '';
  }

  async uploadFile(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new BadRequestException('Credenciales de Cloudinary no configuradas en el .env');
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = `timestamp=${timestamp}${this.apiSecret}`;
      const signature = CryptoJS.SHA1(stringToSign).toString(CryptoJS.enc.Hex);

      const base64File = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const response = await axios.post(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
        file: base64File,
        api_key: this.apiKey,
        timestamp: timestamp,
        signature: signature,
      });

      if (response.data && response.data.secure_url) {
        return response.data.secure_url;
      } else {
        throw new Error('No se recibió la URL segura de Cloudinary');
      }
    } catch (error) {
      console.error('Error al subir a Cloudinary:', error.response?.data || error.message);
      throw new BadRequestException(`Fallo al subir archivo a Cloudinary: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
