import { All, Controller, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('gestion')
  async proxyGestionBase(@Req() req: Request, @Res() res: Response) {
    // Encamina la raiz hacia el microservicio de gestion
    return this.gatewayService.proxyToService(req, res, '/gestion', this.gatewayService.getGestionUrl());
  }

  @All('gestion/*')
  async proxyGestion(@Req() req: Request, @Res() res: Response) {
    // Encamina hacia el microservicio de gestion
    return this.gatewayService.proxyToService(req, res, '/gestion', this.gatewayService.getGestionUrl());
  }

  @All('ia')
  async proxyIaBase(@Req() req: Request, @Res() res: Response) {
    // Encamina la raiz hacia el microservicio de IA
    return this.gatewayService.proxyToService(req, res, '/ia', this.gatewayService.getDjangoUrl());
  }

  @All('ia/*')
  async proxyIa(@Req() req: Request, @Res() res: Response) {
    // Encamina hacia el microservicio de IA
    return this.gatewayService.proxyToService(req, res, '/ia', this.gatewayService.getDjangoUrl());
  }

  @All('django')
  async proxyDjangoBase(@Req() req: Request, @Res() res: Response) {
    // Encamina la raiz hacia el microservicio Django
    return this.gatewayService.proxyToService(req, res, '/django', this.gatewayService.getDjangoUrl());
  }

  @All('django/*')
  async proxyDjango(@Req() req: Request, @Res() res: Response) {
    // Encamina hacia el microservicio Django
    return this.gatewayService.proxyToService(req, res, '/django', this.gatewayService.getDjangoUrl());
  }

  @All('documentos')
  async proxyDocumentosBase(@Req() req: Request, @Res() res: Response) {
    // Encamina la raiz hacia el microservicio de documentos
    return this.gatewayService.proxyToService(
      req,
      res,
      '/documentos',
      this.gatewayService.getDocumentosUrl(),
    );
  }

  @All('documentos/*')
  async proxyDocumentos(@Req() req: Request, @Res() res: Response) {
    // Encamina hacia el microservicio de documentos
    return this.gatewayService.proxyToService(
      req,
      res,
      '/documentos',
      this.gatewayService.getDocumentosUrl(),
    );
  }

  @All('siat')
  async proxySiatBase(@Req() req: Request, @Res() res: Response) {
    // Encamina la raiz hacia el simulador SIAT
    return this.gatewayService.proxyToService(req, res, '/siat', this.gatewayService.getSiatUrl());
  }

  @All('siat/*')
  async proxySiat(@Req() req: Request, @Res() res: Response) {
    // Encamina hacia el simulador SIAT
    return this.gatewayService.proxyToService(req, res, '/siat', this.gatewayService.getSiatUrl());
  }

  @All('graphql')
  async proxyGraphql(@Req() req: Request, @Res() res: Response) {
    // Encamina GraphQL al servicio principal
    return this.gatewayService.proxyGraphql(req, res);
  }
}

