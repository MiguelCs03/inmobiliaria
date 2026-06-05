import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContratoPreviaVistaComponent } from "../contrato-vista-previa/contrato-vista-previa.component";
import { ContratoService } from "../../../../core/services/contrato.service";

@Component({
    selector: 'app-contrato-nuevo',
    standalone: true,
    imports: [ReactiveFormsModule, ContratoPreviaVistaComponent],
    templateUrl: './contrato-nuevo.component.html',
    styleUrls: ['./contrato-nuevo.component.css']
})

export class ContratoNuevoComponent {

    contratoFormulario!: FormGroup;
    previewData: any = null;

    constructor(private fb: FormBuilder, private contratoService: ContratoService) {
        this.contratoFormulario = this.fb.group({
            titulo: ['', Validators.required],
            observaciones: ['', Validators.required],
            clienteId: [1, Validators.required],
            empleadoId: [1, Validators.required],
            propiedadId: [8, Validators.required],
            montoTotal: [110, Validators.required],
        })
    }

    guardar(): void {

        console.log("aqui estoy")
        if(this.contratoFormulario.invalid){
            console.log(this.contratoFormulario.getRawValue())
            console.log("aqui estoy 2")
            return;
        }

        const payload = this.contratoFormulario.getRawValue();
        console.log(payload)
        this.contratoService
            .createContrato(payload)
            .subscribe({
                next: (response) =>{
                    console.log('Contrato creado', response)
                    alert('Contrato creado correctamente');
                },
                error: (error) =>{
                    console.error(error);
                    alert('Error al crear contrato, adm cofa')
                }
            })
    }

    generaPreviaVista(): void {
        this.previewData = this.contratoFormulario.getRawValue();
    }

}