import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SiatService {
  private readonly logger = new Logger(SiatService.name);
  private readonly siatUrl: string;
  private readonly nitEmisor: string;
  private readonly codigoSucursal: number;
  private readonly codigoPuntoVenta: number;
  private readonly modalidad: number;
  private readonly tipoEmision: number;
  private readonly tipoFactura: number;
  private readonly tipoDocumentoSector: number;

  // Cache en memoria para CUIS y CUFD y evitar llamadas repetitivas en el mismo día
  private cachedCuis: string | null = null;
  private cachedCufd: string | null = null;
  private cachedCodigoControl: string | null = null;
  private cufdExpiration: Date | null = null;

  constructor(private readonly configService: ConfigService) {
    // Carga de configuraciones con valores por defecto para pruebas
    this.siatUrl = this.configService.get<string>('SIAT_URL') ?? 'http://localhost:8081';
    this.nitEmisor = this.configService.get<string>('SIAT_NIT_EMISOR') ?? '123456789012';
    this.codigoSucursal = parseInt(this.configService.get<string>('SIAT_SUCURSAL') ?? '0', 10);
    this.codigoPuntoVenta = parseInt(this.configService.get<string>('SIAT_PUNTO_VENTA') ?? '0', 10);
    this.modalidad = parseInt(this.configService.get<string>('SIAT_MODALIDAD') ?? '2', 10); // 2 = Computarizada
    this.tipoEmision = parseInt(this.configService.get<string>('SIAT_TIPO_EMISION') ?? '1', 10); // 1 = Online
    this.tipoFactura = parseInt(this.configService.get<string>('SIAT_TIPO_FACTURA') ?? '1', 10); // 1 = Con Crédito Fiscal
    this.tipoDocumentoSector = parseInt(this.configService.get<string>('SIAT_DOC_SECTOR') ?? '1', 10); // 1 = Compra Venta
  }

  /**
   * FASE 1: Obtener el código CUIS desde el simulador SIAT
   */
  async obtenerCuis(): Promise<string> {
    if (this.cachedCuis) {
      return this.cachedCuis;
    }

    try {
      this.logger.log(`Solicitando CUIS a ${this.siatUrl}`);
      const response = await axios.post(`${this.siatUrl}/api/v2/FacturacionCodigos/cuis`, {
        nit: this.nitEmisor,
        codigoSucursal: this.codigoSucursal,
        codigoPuntoVenta: this.codigoPuntoVenta,
      });

      if (response.data && response.data.transaccion) {
        this.cachedCuis = response.data.codigo;
        this.logger.log(`CUIS obtenido exitosamente: ${this.cachedCuis}`);
        return this.cachedCuis!;
      } else {
        throw new Error(response.data?.mensajesList || 'Error al obtener CUIS');
      }
    } catch (error: any) {
      this.logger.error(`Error en obtenerCuis: ${error.message}`);
      throw new Error(`Error de comunicación con SIAT (CUIS): ${error.message}`);
    }
  }

  /**
   * FASE 2: Obtener el código CUFD diario a partir de un CUIS
   */
  async obtenerCufd(): Promise<{ cufd: string; codigoControl: string }> {
    const ahora = new Date();
    // Si ya tenemos un CUFD almacenado y no ha expirado, lo reutilizamos
    if (this.cachedCufd && this.cachedCodigoControl && this.cufdExpiration && this.cufdExpiration > ahora) {
      return {
        cufd: this.cachedCufd,
        codigoControl: this.cachedCodigoControl,
      };
    }

    const cuis = await this.obtenerCuis();

    try {
      this.logger.log(`Solicitando CUFD usando CUIS: ${cuis}`);
      const response = await axios.post(`${this.siatUrl}/api/v2/FacturacionCodigos/cufd`, {
        cuis: cuis,
      });

      if (response.data && response.data.transaccion) {
        this.cachedCufd = response.data.codigo;
        this.cachedCodigoControl = response.data.codigoControl;
        // El CUFD dura 24 horas. Para seguridad en desarrollo, le damos 23 horas de vigencia interna
        this.cufdExpiration = new Date(ahora.getTime() + 23 * 60 * 60 * 1000);
        
        this.logger.log(`CUFD obtenido: ${this.cachedCufd?.substring(0, 10)}... Control: ${this.cachedCodigoControl}`);
        return {
          cufd: this.cachedCufd!,
          codigoControl: this.cachedCodigoControl!,
        };
      } else {
        throw new Error(response.data?.mensajesList || 'Error al obtener CUFD');
      }
    } catch (error: any) {
      this.logger.error(`Error en obtenerCufd: ${error.message}`);
      throw new Error(`Error de comunicación con SIAT (CUFD): ${error.message}`);
    }
  }

  /**
   * Aplica el algoritmo Módulo 11 según el estándar del SIAT de Bolivia.
   * Agrega dígitos verificadores a la cadena numérica.
   */
  calcularModulo11(cadena: string, numDig: number, limMult: number, x10: boolean): string {
    let mult: number;
    let suma: number;
    let i: number;
    let n: number;
    let dig: number;

    for (n = 1; n <= numDig; n++) {
      suma = 0;
      mult = 2;
      for (i = cadena.length - 1; i >= 0; i--) {
        suma += parseInt(cadena.charAt(i), 10) * mult;
        mult++;
        if (mult > limMult) {
          mult = 2;
        }
      }

      if (x10) {
        dig = ((suma * 10) % 11) % 10;
      } else {
        dig = suma % 11;
      }

      if (dig === 10) {
        cadena += '1';
      } else if (dig === 11) {
        cadena += '0';
      } else {
        cadena += String(dig);
      }
    }
    return cadena;
  }

  /**
   * Algoritmo de Generación de CUF (Código Único de Facturación) de Bolivia.
   * Concatena la información de facturación, calcula el dígito verificador módulo 11,
   * y convierte el resultado a Base 16 (Hexadecimal) para luego sumarle la clave diaria (código de control).
   */
  generarCuf(
    fechaHora: string, // Formato esperado: YYYYMMDDHHMMSSmmm
    nroFactura: number,
    codigoControl: string,
  ): string {
    // 1. Rellenar campos con ceros según longitud estándar
    const nitFormateado = this.nitEmisor.padStart(13, '0');
    const sucursalFormateada = String(this.codigoSucursal).padStart(4, '0');
    const nroFacturaFormateado = String(nroFactura).padStart(10, '0');
    const puntoVentaFormateado = String(this.codigoPuntoVenta).padStart(4, '0');

    // 2. Concatenar la cadena base
    const cadenaCuf =
      nitFormateado +
      fechaHora +
      sucursalFormateada +
      this.modalidad +
      this.tipoEmision +
      this.tipoFactura +
      this.tipoDocumentoSector +
      nroFacturaFormateado +
      puntoVentaFormateado;

    // 3. Calcular el dígito de control Módulo 11 (limite multiplicador 9, sin multiplicar x10)
    const cadenaConDigito = this.calcularModulo11(cadenaCuf, 1, 9, false);
    const digitoControl = cadenaConDigito.charAt(cadenaConDigito.length - 1);
    
    const cadenaCompleta = cadenaCuf + digitoControl;

    // 4. Convertir a Base 16 (Hexadecimal) y concatenar con el código de control criptográfico
    // Se usa BigInt debido a que la cadena tiene 54 dígitos y supera la capacidad del Number en JS
    const numeroAsBigInt = BigInt(cadenaCompleta);
    const cufHexadecimal = numeroAsBigInt.toString(16).toUpperCase();

    return cufHexadecimal + codigoControl;
  }

  /**
   * FASE 3: Enviar la factura al SIAT para su recepción y validación
   */
  async enviarFactura(invoiceData: {
    fechaHora: string; // formato YYYYMMDDHHMMSSmmm
    numeroFactura: number;
    cuf: string;
    cufd: string;
    nitCliente: string;
    montoTotal: number;
  }): Promise<{ transaccion: boolean; codigoRecepcion?: string; mensaje: string }> {
    try {
      this.logger.log(`Enviando factura Nro ${invoiceData.numeroFactura} al simulador SIAT`);
      
      const payload = {
        cufd: invoiceData.cufd,
        nitEmisor: this.nitEmisor,
        fechaHora: invoiceData.fechaHora,
        codigoSucursal: this.codigoSucursal,
        codigoPuntoVenta: this.codigoPuntoVenta,
        numeroFactura: invoiceData.numeroFactura,
        cuf: invoiceData.cuf,
        nitCliente: invoiceData.nitCliente,
        montoTotal: invoiceData.montoTotal,
        
        // Parámetros sectoriales por defecto
        modalidad: this.modalidad,
        tipoEmision: this.tipoEmision,
        tipoFactura: this.tipoFactura,
        tipoDocumentoSector: this.tipoDocumentoSector,
      };

      const response = await axios.post(`${this.siatUrl}/api/v2/ServicioFacturacion/recepcion`, payload);

      if (response.data && response.data.transaccion) {
        return {
          transaccion: true,
          codigoRecepcion: response.data.codigoRecepcion,
          mensaje: response.data.mensajesList || 'Factura validada correctamente',
        };
      } else {
        return {
          transaccion: false,
          mensaje: response.data?.mensajesList || 'Rechazada por el SIAT',
        };
      }
    } catch (error: any) {
      this.logger.error(`Error al enviar factura a SIAT: ${error.message}`);
      return {
        transaccion: false,
        mensaje: error.response?.data?.mensajesList || `Error interno al comunicar con el SIAT: ${error.message}`,
      };
    }
  }

  // Getters útiles para la configuración
  getNitEmisor(): string {
    return this.nitEmisor;
  }
}
