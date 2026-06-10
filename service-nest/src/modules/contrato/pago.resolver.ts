import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PagoService } from './repository/pago.service';
import { Factura } from './entities/factura.entity';
import { Pago } from './entities/pago.entity';
import { PagarCuotaInput } from './dto/pagar-cuota.input';
import { FacturaResponse, FacturaListResponse } from './dto/factura-response.dto';

@Resolver()
export class PagoResolver {
  constructor(private readonly pagoService: PagoService) {}

  /**
   * Mutación para pagar y facturar una cuota del plan de pagos.
   * Conecta con el simulador SIAT para validar la factura en línea.
   */
  @Mutation(() => FacturaResponse)
  async pagarCuota(
    @Args('pagarCuotaInput') pagarCuotaInput: PagarCuotaInput,
  ): Promise<FacturaResponse> {
    try {
      const data = await this.pagoService.pagarCuota(
        pagarCuotaInput.planPagoId,
        pagarCuotaInput.nitCliente,
        pagarCuotaInput.razonSocial,
        pagarCuotaInput.metodoPago,
      );
      return {
        success: true,
        message: 'Cuota pagada y factura SIAT generada exitosamente.',
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al procesar el pago y facturación.',
        data: null,
      };
    }
  }

  /**
   * Consulta para listar todas las facturas del sistema.
   */
  @Query(() => FacturaListResponse, { name: 'facturas' })
  async findAllFacturas(): Promise<FacturaListResponse> {
    try {
      const data = await this.pagoService.findAllFacturas();
      return {
        success: true,
        message: 'Facturas listadas correctamente.',
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al listar las facturas.',
        data: null,
      };
    }
  }

  /**
   * Consulta para listar todos los pagos del sistema.
   */
  @Query(() => [Pago], { name: 'pagos' })
  async findAllPagos(): Promise<Pago[]> {
    return this.pagoService.findAllPagos();
  }
}
