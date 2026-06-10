import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { ServiceAccount } from 'firebase-admin';
import * as fs from 'fs';

@Injectable()
export class NotificacionesService implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesService.name);
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    try {
      let serviceAccount: ServiceAccount;

      const rutaJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
      if (rutaJson && fs.existsSync(rutaJson)) {
        const raw = fs.readFileSync(rutaJson, 'utf-8');
        serviceAccount = JSON.parse(raw);
        this.logger.log(`Inicializando Firebase desde archivo: ${rutaJson}`);
      } else {
        const b64 = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_B64');
        if (!b64) {
          this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH ni FIREBASE_SERVICE_ACCOUNT_B64 definidos. Notificaciones deshabilitadas.');
          return;
        }
        const json = Buffer.from(b64, 'base64').toString('utf-8');
        serviceAccount = JSON.parse(json);
        this.logger.log('Inicializando Firebase desde variable base64.');
      }

      initializeApp({ credential: cert(serviceAccount) });
      this.initialized = true;
      this.logger.log('Firebase Admin inicializado correctamente.');
    } catch (error) {
      this.logger.error('Error al inicializar Firebase Admin:', error);
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.initialized) {
      this.logger.warn('Firebase no inicializado. Notificacion no enviada.');
      return;
    }

    try {
      const message = {
        topic,
        notification: { title, body },
        data,
      };

      const response = await getMessaging().send(message);
      this.logger.log(`Notificacion enviada al topic "${topic}": ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error al enviar notificacion al topic "${topic}":`, error);
    }
  }

  async sendToToken(token: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.initialized) {
      this.logger.warn('Firebase no inicializado. Notificacion no enviada.');
      return;
    }

    try {
      const message = {
        token,
        notification: { title, body },
        data,
      };

      const response = await getMessaging().send(message);
      this.logger.log(`Notificacion enviada a token: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error al enviar notificacion a token:`, error);
    }
  }
}
