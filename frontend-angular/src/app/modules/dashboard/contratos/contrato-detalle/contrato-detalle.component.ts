import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Observable, BehaviorSubject, switchMap } from "rxjs";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contrato-detalle.component.html',
  styleUrls: ['./contrato-detalle.component.css']
})
export class ContratoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contratoService = inject(ContratoService);

  contratoId!: number;
  
  // Variables para la gestión del modal de facturación y pagos
  showPaymentModal = false;
  selectedCuota: any = null;
  nitCliente = '';
  razonSocial = '';
  metodoPago = 'QR';
  procesandoPago = false;

  // 1. Creamos un disparador reactivo
  private refreshContrato$ = new BehaviorSubject<void>(undefined);
  contrato$!: Observable<any>;

  ngOnInit(): void {
    this.contratoId = Number(this.route.snapshot.paramMap.get('id'));

    // 2. Cada vez que refreshContrato emita un valor, se pedirán los datos actualizados
    this.contrato$ = this.refreshContrato$.pipe(
      switchMap(() => this.contratoService.getContratoById(this.contratoId))
    );
  }

  // 3. Para recargar, solo ordenamos al disparador que emita un nuevo evento
  refrescarDatos(): void {
    this.refreshContrato$.next();
  }

  generarPdf(): void {
    this.contratoService.generatePdf(this.contratoId).subscribe({
      next: () => {
        alert('¡PDF generado con éxito!');
        this.refrescarDatos(); // <--- Recarga reactiva
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el PDF.');
      }
    });
  }

  registrarBlockchain(): void {
    this.contratoService.registerBlockchain(this.contratoId).subscribe({
      next: (response) => {
        console.log('Blockchain registrada', response);
        alert('¡Contrato registrado en la Blockchain exitosamente!');
        this.refrescarDatos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al registrar en Blockchain.');
      }
    });
  }

  verPdf(): void {
    this.contratoService.getPdfUrl(this.contratoId).subscribe({
      next: (signedUrl) => window.open(signedUrl, '_blank'),
      error: (err) => console.error(err)
    });
  }

  generarPdfFirmado(): void {
    this.contratoService.generateSignedPdf(this.contratoId).subscribe({
      next: () => {
        alert('¡PDF firmado generado con éxito!');
        this.refrescarDatos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al generar el PDF firmado.');
      }
    });
  }

  // Abre el modal para proceder con el pago y precarga los datos del cliente
  abrirPagoModal(cuota: any, cliente: any): void {
    this.selectedCuota = cuota;
    this.nitCliente = cliente?.ciNit || '';
    this.razonSocial = cliente?.nombres || '';
    this.metodoPago = 'QR';
    this.showPaymentModal = true;
  }

  // Cierra el modal y limpia el estado del pago
  cerrarPagoModal(): void {
    this.showPaymentModal = false;
    this.selectedCuota = null;
    this.nitCliente = '';
    this.razonSocial = '';
    this.procesandoPago = false;
  }

  // Confirma el pago de la cuota llamando al servicio GraphQL
  confirmarPago(): void {
    if (!this.nitCliente.trim() || !this.razonSocial.trim()) {
      alert('Por favor complete el NIT/CI y la Razón Social.');
      return;
    }

    this.procesandoPago = true;

    const input = {
      planPagoId: Number(this.selectedCuota.id),
      nitCliente: this.nitCliente.trim(),
      razonSocial: this.razonSocial.trim(),
      metodoPago: this.metodoPago
    };

    this.contratoService.pagarCuota(input).subscribe({
      next: (response) => {
        this.procesandoPago = false;
        if (response.success) {
          alert(`¡Pago procesado con éxito!\nFactura Nro: ${response.data.nroFactura}\nCUF: ${response.data.cuf}`);
          this.cerrarPagoModal();
          this.refrescarDatos(); // Recargar datos reactivamente
        } else {
          alert(`Error al procesar el pago: ${response.message}`);
        }
      },
      error: (err) => {
        this.procesandoPago = false;
        console.error(err);
        alert('Ocurrió un error inesperado al procesar el pago.');
      }
    });
  }
}