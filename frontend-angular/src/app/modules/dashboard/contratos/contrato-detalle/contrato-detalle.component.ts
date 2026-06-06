import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
  selector: 'app-contrato-detalle',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl:
    './contrato-detalle.component.html',
  styleUrls: [
    './contrato-detalle.component.css'
  ]
})
export class ContratoDetalleComponent
  implements OnInit {

  private route =
    inject(ActivatedRoute);

  contrato$!: Observable<any>;
  contratoId!: number;

  constructor(
    private contratoService:
      ContratoService
  ) { }

  ngOnInit(): void {

    this.contratoId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.cargarContrato();

  }
  //para que se carguen cada que existan cambios en el documentos
  cargarContrato(): void {

    this.contrato$ =
      this.contratoService
        .getContratoById(
          this.contratoId
        );

  }

  generarPdf(): void {

    this.contratoService
      .generatePdf(
        this.contratoId
      )
      .subscribe({

        next: () => {

          this.cargarContrato();

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  registrarBlockchain(): void {

    this.contratoService
      .registerBlockchain(
        this.contratoId
      )
      .subscribe({

        next: (response) => {
          console.log(
            'Blockchain registrada',
            response
          );
          this.cargarContrato();

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  verPdf(): void {

  this.contratoService
    .getPdfUrl(
      this.contratoId
    )
    .subscribe({

      next: (
        signedUrl
      ) => {

        window.open(
          signedUrl,
          '_blank'
        );

      },

      error: (
        error
      ) => {

        console.error(
          error
        );

      }

    });

}

}