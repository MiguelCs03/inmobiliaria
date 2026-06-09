import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable, BehaviorSubject, switchMap } from "rxjs";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contrato-detalle.component.html',
  styleUrls: ['./contrato-detalle.component.css']
})
export class ContratoDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private contratoService = inject(ContratoService);

  contratoId!: number;
  
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
}