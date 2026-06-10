import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from "@angular/router";
import { ContratoService } from "../../../../core/services/contrato.service";
import { ClienteService } from '../../../../core/services/cliente.service';
import { PropiedadService } from "../../../../core/services/propiedad.service";

interface Cliente {
    id: number;
    nombre: string;
    ciNit: string;
}

interface Propiedad {
    id: number;
    codigo?: string; // Propiedad opcional por si maneja códigos visuales
}

@Component({
    selector: 'app-contrato-nuevo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
    templateUrl: './contrato-nuevo.component.html',
    styleUrls: ['./contrato-nuevo.component.css']
})
export class ContratoNuevoComponent implements OnInit {

    private router = inject(Router);
    contratoFormulario!: FormGroup;
    previewData: any = null;

    clientesMock: Cliente[] = [];
    clientesFiltrados: Cliente[] = [];

    propiedadesMock: Propiedad[] = [];
    propiedadesFiltradas: Propiedad[] = [];

    busquedaPropiedad: string = '';
    mostrarPropiedades: boolean = false;

    busquedaCliente: string = '';
    mostrarSugerencias: boolean = false;

    constructor(
        private fb: FormBuilder,
        private contratoService: ContratoService,
        private clienteService: ClienteService,
        private propiedadService: PropiedadService
    ) {
        this.contratoFormulario = this.fb.group({
            titulo: ['', Validators.required],
            observaciones: ['', Validators.required],
            clienteId: [null, Validators.required],
            empleadoId: [1, Validators.required],
            propiedadId: [null, Validators.required], // Inicializado en null para obligar la búsqueda
            montoTotal: [null, [Validators.required, Validators.min(1)]], // Campo editable con validación básica
            fechaInicio: ['', Validators.required], // Nuevo campo
            fechaFin: ['', Validators.required]     // Nuevo campo
        });
    }

    ngOnInit(): void {
        this.cargarClientes();
        this.cargarPropiedades();
    }

    cargarClientes(): void {
        this.clienteService
            .getClientes()
            .subscribe({
                next: (response: any) => {
                    const listaClientes = response || [];
                    this.clientesMock = listaClientes.map((c: any) => ({
                        id: c.id,
                        ciNit: c.ciNit ? String(c.ciNit).trim() : '',
                        nombre: `NIT/CI: ${c.ciNit || 'Sin Documento'}`
                    }));
                    this.clientesFiltrados = [...this.clientesMock];
                },
                error: (err) => {
                    console.error('Error cargando clientes', err);
                }
            });
    }

    cargarPropiedades(): void {
        this.propiedadService
            .getPropiedades()
            .subscribe({
                next: (response: any) => {
                    // Ajustar la asignación según la estructura de respuesta de su API de propiedades
                    const listaPropiedades = Array.isArray(response) ? response : (response?.data || []);

                    this.propiedadesMock = listaPropiedades.map((p: any) => ({
                        id: p.id
                    }));
                    this.propiedadesFiltradas = [...this.propiedadesMock];
                },
                error: (err) => {
                    console.error('Error cargando propiedades', err);
                }
            });
    }

    filtrarClientes(event: Event): void {
        const termino = (event.target as HTMLInputElement).value.toLowerCase().trim();
        this.busquedaCliente = (event.target as HTMLInputElement).value;

        this.contratoFormulario.get('clienteId')?.setValue(null);

        if (!termino) {
            this.clientesFiltrados = [...this.clientesMock];
            return;
        }

        this.clientesFiltrados = this.clientesMock.filter(cliente =>
            cliente.ciNit.toLowerCase().includes(termino)
        );
    }

    filtrarPropiedades(event: Event): void {
        const termino = (event.target as HTMLInputElement).value.toLowerCase().trim();
        this.busquedaPropiedad = (event.target as HTMLInputElement).value;

        this.contratoFormulario.get('propiedadId')?.setValue(null);

        if (!termino) {
            this.propiedadesFiltradas = [...this.propiedadesMock];
            return;
        }

        // Filtrado por ID numérico de la propiedad
        this.propiedadesFiltradas = this.propiedadesMock.filter(propiedad =>
            String(propiedad.id).toLowerCase().includes(termino)
        );
    }

    seleccionarCliente(cliente: Cliente): void {
        this.busquedaCliente = cliente.ciNit;
        this.contratoFormulario.get('clienteId')?.setValue(cliente.id);
        this.mostrarSugerencias = false;
    }

    seleccionarPropiedad(propiedad: Propiedad): void {
        this.busquedaPropiedad = `Propiedad ID: ${propiedad.id}`;
        this.contratoFormulario.get('propiedadId')?.setValue(propiedad.id);
        this.mostrarPropiedades = false;
    }

    ocultarSugerencias(): void {
        setTimeout(() => {
            this.mostrarSugerencias = false;
        }, 200);
    }

    ocultarPropiedades(): void {
        setTimeout(() => {
            this.mostrarPropiedades = false;
        }, 200);
    }

    guardar(): void {
        if (this.contratoFormulario.invalid) {
            this.contratoFormulario.markAllAsTouched();
            console.log('Formulario inválido', this.contratoFormulario.getRawValue());
            return;
        }

        const payload = this.contratoFormulario.getRawValue();
        payload.fechaInicio =
            new Date(payload.fechaInicio).toISOString();

        payload.fechaFin =
            new Date(payload.fechaFin).toISOString();

        console.log(payload)
        this.contratoService
            .createContrato(payload)
            .subscribe({
                next: (response) => {
                    console.log('Contrato creado con éxito', response);
                    alert('Contrato creado correctamente');
                    this.volver();
                },
                error: (error) => {
                    console.error(error);
                    alert('Error al crear el contrato');
                }
            });
    }

    generaPreviaVista(): void {
        this.previewData = this.contratoFormulario.getRawValue();
    }

    volver(): void {
        this.router.navigate(['/admin/contratos']);
    }
}


