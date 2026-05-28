import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';
import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import type { Request, Response } from 'express';

@Injectable()
export class GatewayService {
  private readonly gestionUrl: string;
  private readonly djangoUrl: string;
  private readonly documentosUrl: string;
  private readonly graphqlUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.gestionUrl =
      this.configService.get<string>('GATEWAY_GESTION_URL') ?? 'http://localhost:3003/api/v1/gestion';
    this.djangoUrl =
      this.configService.get<string>('GATEWAY_DJANGO_URL') ??
      this.configService.get<string>('GATEWAY_IA_URL') ??
      'http://127.0.0.1:8000/api/v1';
    this.documentosUrl =
      this.configService.get<string>('GATEWAY_DOCUMENTOS_URL') ?? 'http://localhost:8080';
    this.graphqlUrl = this.configService.get<string>('GATEWAY_GRAPHQL_URL') ?? 'http://localhost:3003/graphql';
  }

  // Reenvia la solicitud al microservicio destino
  async proxyToService(req: Request, res: Response, basePath: string, targetBaseUrl: string) {
    const targetUrl = this.buildTargetUrl(req.originalUrl, basePath, targetBaseUrl);
    const isMultipart = req.is('multipart/form-data');
    const config: AxiosRequestConfig = {
      url: targetUrl,
      method: req.method as AxiosRequestConfig['method'],
      headers: this.filterHeaders(req.headers),
      data: isMultipart ? req : req.body,
      responseType: 'stream',
      validateStatus: () => true,
    };

    const response = await axios.request(config);
    res.status(response.status);
    this.forwardHeaders(response.headers, res);
    response.data.pipe(res);
  }

  // Proxy especifico para GraphQL
  async proxyGraphql(req: Request, res: Response) {
    const config: AxiosRequestConfig = {
      url: this.graphqlUrl,
      method: req.method as AxiosRequestConfig['method'],
      headers: this.filterHeaders(req.headers),
      data: req.body,
      responseType: 'stream',
      validateStatus: () => true,
    };

    const response = await axios.request(config);
    res.status(response.status);
    this.forwardHeaders(response.headers, res);
    response.data.pipe(res);
  }

  getGestionUrl(): string {
    return this.gestionUrl;
  }

  getDjangoUrl(): string {
    return this.djangoUrl;
  }

  getDocumentosUrl(): string {
    return this.documentosUrl;
  }

  private buildTargetUrl(originalUrl: string, basePath: string, targetBaseUrl: string): string {
    const trimmedBase = originalUrl.startsWith(basePath)
      ? originalUrl.slice(basePath.length)
      : originalUrl;
    return `${targetBaseUrl}${trimmedBase}`;
  }

  private filterHeaders(headers: Request['headers']): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (!value) {
        continue;
      }
      if (key.toLowerCase() === 'host' || key.toLowerCase() === 'content-length') {
        continue;
      }
      result[key] = Array.isArray(value) ? value.join(',') : value;
    }
    return result;
  }

  private forwardHeaders(headers: AxiosResponseHeaders | RawAxiosResponseHeaders, res: Response) {
    Object.entries(headers).forEach(([key, value]) => {
      if (key.toLowerCase() === 'transfer-encoding') {
        return;
      }
      if (Array.isArray(value)) {
        res.setHeader(key, value.join(','));
        return;
      }
      if (value !== undefined) {
        res.setHeader(key, String(value));
      }
    });
  }
}
