import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanPago, PlanPagoEstado } from '../entities/plan-pago.entity';
import { Factura } from '../entities/factura.entity';
import { Pago } from '../entities/pago.entity';
import { Contrato } from '../entities/contrato.entity';
import { SiatService } from './siat.service';

@Injectable()
export class PagoService {
  private readonly logger = new Logger(PagoService.name);

  constructor(
    @InjectRepository(PlanPago)
    private readonly planPagoRepository: Repository<PlanPago>,
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Pago)
    private readonly pagoRepository: Repository<Pago>,
    @InjectRepository(Contrato)
    private readonly contratoRepository: Repository<Contrato>,
    private readonly siatService: SiatService,
  ) {}

  /**
   * Obtiene todos los pagos registrados
   */
  async findAllPagos(): Promise<Pago[]> {
    return this.pagoRepository.find({ relations: ['factura'] });
  }

  /**
   * Obtiene todas las facturas registradas
   */
  async findAllFacturas(): Promise<Factura[]> {
    return this.facturaRepository.find({ relations: ['planPago'] });
  }

  /**
   * Lógica de Negocio Principal: Registrar pago de cuota y generar Factura Electrónica SIAT
   */
  async pagarCuota(
    planPagoId: number,
    nitCliente: string,
    razonSocial: string,
    metodoPago: string,
  ): Promise<Factura> {
    this.logger.log(`Iniciando proceso de pago para cuota ID: ${planPagoId}`);

    // 1. Validar la existencia de la cuota del Plan de Pagos
    const planPago = await this.planPagoRepository.findOne({
      where: { id: planPagoId },
      relations: ['contrato', 'contrato.cliente'],
    });

    if (!planPago) {
      throw new NotFoundException(`La cuota de pago con ID ${planPagoId} no existe.`);
    }

    // 2. Verificar que no haya sido pagada previamente
    if (planPago.estado === PlanPagoEstado.Pagado) {
      throw new BadRequestException('Esta cuota ya ha sido pagada y facturada.');
    }

    // 3. Solicitar CUFD vigente de la inmobiliaria al servicio de SIAT
    let cufdData;
    try {
      cufdData = await this.siatService.obtenerCufd();
    } catch (error: any) {
      this.logger.error(`Error al obtener CUFD para la factura: ${error.message}`);
      throw new BadRequestException(`No se pudo obtener el código CUFD del SIAT: ${error.message}`);
    }

    // 4. Determinar el siguiente número secuencial de factura para este punto de venta
    const lastFactura = await this.facturaRepository.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    
    // Si es la primera factura, comenzamos en 1
    const nextNroFactura = lastFactura ? Number(lastFactura.nroFactura) + 1 : 1;

    // 5. Formatear la fecha actual al formato que requiere el algoritmo SIAT: YYYYMMDDHHMMSSmmm
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const mmm = String(now.getMilliseconds()).padStart(3, '0');
    const fechaHoraFormateada = `${YYYY}${MM}${DD}${HH}${mm}${ss}${mmm}`;

    // 6. Generar el CUF (Código Único de Facturación) utilizando el algoritmo del SIAT
    const cuf = this.siatService.generarCuf(fechaHoraFormateada, nextNroFactura, cufdData.codigoControl);

    // 7. Enviar la factura generada para su recepción y validación en el simulador SIAT
    const siatResponse = await this.siatService.enviarFactura({
      fechaHora: fechaHoraFormateada,
      numeroFactura: nextNroFactura,
      cuf: cuf,
      cufd: cufdData.cufd,
      nitCliente: nitCliente,
      montoTotal: Number(planPago.montoCuota),
    });

    // 8. Validar la respuesta del SIAT
    if (!siatResponse.transaccion) {
      this.logger.warn(`Factura Nro ${nextNroFactura} rechazada por SIAT: ${siatResponse.mensaje}`);
      throw new BadRequestException(`El SIAT rechazó la factura: ${siatResponse.mensaje}`);
    }

    this.logger.log(`Factura Nro ${nextNroFactura} validada por SIAT. Código recepción: ${siatResponse.codigoRecepcion}`);

    // 9. Crear el registro físico de la Factura en base de datos
    const nuevaFactura = this.facturaRepository.create({
      planPagoId: planPago.id,
      nroFactura: String(nextNroFactura),
      montoTotal: planPago.montoCuota,
      fechaEmision: now,
      cuf: cuf,
      codigoRecepcion: siatResponse.codigoRecepcion,
      estadoSiat: 'VALIDA',
      nitCliente: nitCliente,
      razonSocial: razonSocial,
      cufdUsado: cufdData.cufd,
    });

    const facturaGuardada = await this.facturaRepository.save(nuevaFactura);

    // 10. Crear el registro del Pago correspondiente a la factura
    const nuevoPago = this.pagoRepository.create({
      facturaId: facturaGuardada.id,
      monto: planPago.montoCuota,
      metodo: metodoPago,
    });

    await this.pagoRepository.save(nuevoPago);

    // 11. Cambiar el estado de la cuota del Plan de Pagos a "Pagado"
    planPago.estado = PlanPagoEstado.Pagado;
    await this.planPagoRepository.save(planPago);

    this.logger.log(`Cuota ID ${planPagoId} marcada como PAGADA con éxito.`);

    return facturaGuardada;
  }
}
