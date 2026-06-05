import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContratoPreviaVistaComponent } from "../contrato-vista-previa/contrato-vista-previa.component";


@Component({
    selector: 'app-contrato-nuevo',
    standalone: true,
    imports: [ReactiveFormsModule, ContratoPreviaVistaComponent],
    templateUrl: './contrato-nuevo.component.html',
    styleUrls: ['./contrato-nuevo.component.css']
})

export class ContratoNuevoComponent{

    contratoFormulario!: FormGroup;
    previewData: any = null;

    constructor(private fb: FormBuilder){
        this.contratoFormulario = this.fb.group({
            titulo:['', Validators.required],
            nombreCliente:['', Validators.required],
            usuario:['', Validators.required],
            observaciones:['', Validators.required],
        })
    }

    guardar(): void {
        console.log(this.contratoFormulario.value)
    }

    generaPreviaVista(): void {
        this.previewData = this.contratoFormulario.getRawValue();
    }

}