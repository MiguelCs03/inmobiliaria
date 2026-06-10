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
  
  // Variables para la gestión del modal de factura SIAT
  showInvoiceModal = false;
  selectedCuota: any = null;

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

  // Abre el modal para ver la factura SIAT
  abrirInvoiceModal(cuota: any): void {
    this.selectedCuota = cuota;
    this.showInvoiceModal = true;
  }

  // Cierra el modal de la factura SIAT
  cerrarInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.selectedCuota = null;
  }

  // Convierte un monto numérico a formato literal en bolivianos
  obtenerMontoEnLiteral(monto: number): string {
    const dec = Math.round((monto % 1) * 100);
    const entero = Math.floor(monto);
    const letras = this.convertirEnteroALetras(entero);
    const centavos = dec < 10 ? '0' + dec : dec;
    return `SON: ${letras} ${centavos}/100 BOLIVIANOS`;
  }

  private convertirEnteroALetras(n: number): string {
    if (n === 0) return 'CERO';
    
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = {
      11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
      16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
      21: 'VEINTIUNO', 22: 'VEINTIDOS', 23: 'VEINTITRES', 24: 'VEINTICUATRO', 25: 'VEINTICINCO',
      26: 'VEINTISEIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
    };
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    let words = '';

    if (n >= 1000000) {
      const millones = Math.floor(n / 1000000);
      if (millones === 1) {
        words += 'UN MILLON ';
      } else {
        words += this.convertirEnteroALetras(millones) + ' MILLONES ';
      }
      n %= 1000000;
    }

    if (n >= 1000) {
      const miles = Math.floor(n / 1000);
      if (miles === 1) {
        words += 'MIL ';
      } else {
        words += this.convertirEnteroALetras(miles) + ' MIL ';
      }
      n %= 1000;
    }

    if (n >= 100) {
      if (n === 100) {
        words += 'CIEN ';
      } else {
        words += centenas[Math.floor(n / 100)] + ' ';
      }
      n %= 100;
    }

    if (n > 0) {
      if (n in especiales) {
        words += (especiales as any)[n] + ' ';
      } else {
        const dec = Math.floor(n / 10);
        const uni = n % 10;
        if (dec > 0) {
          words += decenas[dec];
          if (uni > 0) {
            words += ' Y ' + unidades[uni];
          }
        } else {
          words += unidades[uni];
        }
        words += ' ';
      }
    }

    return words.trim();
  }
}