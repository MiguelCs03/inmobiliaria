import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { UploadService } from '../../../core/services/upload.service';

export interface Propiedad {
  id: number;
  propietarioId: number;
  tipoPropiedadId: number;
  tipoOperacionId: number;
  estadoPropiedadId: number;
  precioBase: number;
  areaM2: number;
  ubicacion: string | null;
  imagenes?: { id: number; urlS3: string }[];
}

export interface Propietario {
  id: number;
  nombres: string;
}

interface PropiedadesQueryResponse {
  propiedades: {
    success: boolean;
    message: string;
    data: Propiedad[] | null;
  };
}

interface PropietariosQueryResponse {
  propietarios: {
    success: boolean;
    message: string;
    data: Propietario[] | null;
  };
}

interface CreatePropiedadMutationResponse {
  createPropiedad: {
    success: boolean;
    message: string;
    data: Propiedad | null;
  };
}

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private cdr = inject(ChangeDetectorRef);
  private uploadService = inject(UploadService);

  propiedadForm!: FormGroup;
  propiedades: Propiedad[] = [];
  propietarios: Propietario[] = [];
  filteredPropiedades: Propiedad[] = [];

  loadingList = false;
  loadingPropietarios = false;
  submitting = false;
  showModal = false; // Control de visualización del modal emergente

  uploadedImagenesUrls: string[] = [];
  uploadingImagen = false;

  successMessage = '';
  errorMessage = '';
  filterType = '0'; // 0 = Todos, 1 = Venta, 2 = Alquiler, 3 = Anticrético

  private successTimeout: any = null;
  private errorTimeout: any = null;

  showSuccess(message: string): void {
    if (this.successTimeout) clearTimeout(this.successTimeout);
    this.successMessage = message;
    this.errorMessage = '';
    this.cdr.detectChanges();
    this.successTimeout = setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  showError(message: string): void {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorMessage = message;
    this.successMessage = '';
    this.cdr.detectChanges();
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  // Catálogos locales para mapear IDs a nombres descriptivos
  tiposPropiedad = [
    { id: 1, nombre: 'Casa' },
    { id: 2, nombre: 'Departamento' },
    { id: 3, nombre: 'Terreno' },
    { id: 4, nombre: 'Oficina' }
  ];

  tiposOperacion = [
    { id: 1, nombre: 'Venta' },
    { id: 2, nombre: 'Alquiler' },
    { id: 3, nombre: 'Anticrético' }
  ];

  estadosPropiedad = [
    { id: 1, nombre: 'Disponible' },
    { id: 2, nombre: 'Reservado' },
    { id: 3, nombre: 'Vendido / Rentado' }
  ];

  private readonly GET_PROPIEDADES = gql`
    query GetPropiedades {
      propiedades {
        success
        message
        data {
          id
          propietarioId
          tipoPropiedadId
          tipoOperacionId
          estadoPropiedadId
          precioBase
          areaM2
          ubicacion
          imagenes {
            id
            urlS3
          }
        }
      }
    }
  `;

  private readonly GET_PROPIETARIOS = gql`
    query GetPropietarios {
      propietarios {
        success
        message
        data {
          id
          nombres
        }
      }
    }
  `;

  private readonly CREATE_PROPIEDAD = gql`
    mutation CreatePropiedad($input: CreatePropiedadInput!) {
      createPropiedad(createPropiedadInput: $input) {
        success
        message
        data {
          id
          propietarioId
          tipoPropiedadId
          tipoOperacionId
          estadoPropiedadId
          precioBase
          areaM2
          ubicacion
          imagenes {
            id
            urlS3
          }
        }
      }
    }
  `;

  ngOnInit(): void {
    this.initForm();
    this.loadPropietarios();
    this.loadPropiedades();
  }

  private initForm(): void {
    this.propiedadForm = this.fb.group({
      propietarioId: ['', [Validators.required]],
      tipoPropiedadId: ['', [Validators.required]],
      tipoOperacionId: ['', [Validators.required]],
      estadoPropiedadId: ['', [Validators.required]],
      precioBase: ['', [Validators.required, Validators.min(100)]],
      areaM2: ['', [Validators.required, Validators.min(5)]],
      ubicacion: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  openModal(): void {
    this.showModal = true;
    this.uploadedImagenesUrls = [];
    this.uploadingImagen = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadPropietarios(); // Recargar propietarios por si acaso
  }

  closeModal(): void {
    this.showModal = false;
    this.uploadedImagenesUrls = [];
    this.uploadingImagen = false;
    this.propiedadForm.reset({
      propietarioId: '',
      tipoPropiedadId: '',
      tipoOperacionId: '',
      estadoPropiedadId: ''
    });
  }

  loadPropietarios(): void {
    this.loadingPropietarios = true;
    this.cdr.detectChanges();
    this.apollo.watchQuery<PropietariosQueryResponse>({
      query: this.GET_PROPIETARIOS,
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        this.loadingPropietarios = false;
        if (result.data?.propietarios?.success && result.data.propietarios.data) {
          this.propietarios = result.data.propietarios.data as Propietario[];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPropietarios = false;
        console.error('Error loading owners:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadPropiedades(): void {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.apollo.watchQuery<PropiedadesQueryResponse>({
      query: this.GET_PROPIEDADES,
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        this.loadingList = false;
        if (result.data?.propiedades?.success !== false) {
          this.propiedades = (result.data?.propiedades?.data || []) as Propiedad[];
          this.applyFilter();
        } else {
          this.showError(result.data?.propiedades?.message || 'Error al obtener propiedades.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingList = false;
        console.error('Error loading properties:', err);
        this.showError('No se pudo conectar con el servidor. Verifique si el API Gateway y el microservicio están activos.');
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.uploadingImagen = true;
    this.cdr.detectChanges();

    const file = files[0];
    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.uploadingImagen = false;
        if (res.success && res.url) {
          this.uploadedImagenesUrls.push(res.url);
          this.showSuccess('Imagen cargada correctamente.');
        } else {
          this.showError(res.message || 'Error al cargar imagen.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadingImagen = false;
        console.error('Error uploading property image:', err);
        this.showError('Error de red al intentar subir la imagen.');
        this.cdr.detectChanges();
      }
    });
  }

  removeUploadedImage(index: number): void {
    this.uploadedImagenesUrls.splice(index, 1);
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (this.propiedadForm.invalid) {
      this.propiedadForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const formValues = this.propiedadForm.value;
    const input = {
      propietarioId: parseInt(formValues.propietarioId, 10),
      tipoPropiedadId: parseInt(formValues.tipoPropiedadId, 10),
      tipoOperacionId: parseInt(formValues.tipoOperacionId, 10),
      estadoPropiedadId: parseInt(formValues.estadoPropiedadId, 10),
      precioBase: parseFloat(formValues.precioBase),
      areaM2: parseFloat(formValues.areaM2),
      ubicacion: formValues.ubicacion,
      imagenesUrls: this.uploadedImagenesUrls
    };

    this.apollo.mutate<CreatePropiedadMutationResponse>({
      mutation: this.CREATE_PROPIEDAD,
      variables: { input }
    }).subscribe({
      next: (result) => {
        this.submitting = false;
        const res = result.data?.createPropiedad;
        if (res?.success && res.data) {
          this.showSuccess('¡Casa/Inmueble registrado de forma exitosa!');
          this.closeModal();
          this.loadPropiedades();
        } else {
          this.showError(res?.message || 'Error al registrar propiedad.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating property:', err);
        this.showError('Error de red al intentar registrar. Intente más tarde.');
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(event: any): void {
    this.filterType = event.target.value;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.filterType === '0') {
      this.filteredPropiedades = [...this.propiedades];
      return;
    }
    const filterId = parseInt(this.filterType, 10);
    this.filteredPropiedades = this.propiedades.filter(p => p.tipoOperacionId === filterId);
  }

  // Helpers para mostrar textos amigables en las tarjetas
  getTipoPropiedadNombre(id: number): string {
    return this.tiposPropiedad.find(t => t.id === id)?.nombre || 'Propiedad';
  }

  getTipoOperacionNombre(id: number): string {
    return this.tiposOperacion.find(t => t.id === id)?.nombre || 'Venta';
  }

  getEstadoPropiedadNombre(id: number): string {
    return this.estadosPropiedad.find(e => e.id === id)?.nombre || 'Disponible';
  }

  getPropietarioNombre(id: number): string {
    return this.propietarios.find(p => p.id === id)?.nombres || `Propietario #${id}`;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propiedadForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
