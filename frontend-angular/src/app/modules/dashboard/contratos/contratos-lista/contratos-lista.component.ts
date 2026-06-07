import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { Observable } from "rxjs";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
  selector: 'app-contratos-lista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contratos-lista.component.html',
  styleUrls: ['./contratos-lista.component.css']
})
export class ContractosListaComponent implements OnInit {
  private router = inject(Router);

  // Usar async pipe para que Angular refresque la vista incluso si Apollo emite fuera de Zone.js
  contratos$!: Observable<any[]>;

  constructor(
    private contratoService: ContratoService
  ) { }

  ngOnInit(): void {
    this.contratos$ = this.contratoService.getContratos();
  }

  navegarA() {
    // Aquí puedes ejecutar lógica intermedia antes de la redirección
    console.log('Guardando datos antes de salir...');

    // Redirección por código
    this.router.navigate(['/admin/contrato-nuevo']);

    // Si la ruta tiene parámetros:
    // this.router.navigate(['/detalle', idContrato]);
  }

  verContrato(
    id: number
  ) {
    console.log("hola")
    this.router.navigate([
      '/admin/contratos',
      id
    ]);

  }
}