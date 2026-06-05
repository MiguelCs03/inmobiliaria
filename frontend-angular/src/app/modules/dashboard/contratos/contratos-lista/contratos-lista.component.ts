import { Component, inject } from "@angular/core";
import { Router} from "@angular/router";

@Component({
    selector:'app-contratos-lista',
    standalone:true,
    templateUrl:'./contratos-lista.component.html',
    styleUrls: ['./contratos-lista.component.css']
})
export class ContractosListaComponent {
    private router = inject(Router);

    navegarA() {
    // Aquí puedes ejecutar lógica intermedia antes de la redirección
    console.log('Guardando datos antes de salir...');

    // Redirección por código
    this.router.navigate(['/admin/contrato-nuevo']);
    
    // Si la ruta tiene parámetros:
    // this.router.navigate(['/detalle', idContrato]);
  }
}