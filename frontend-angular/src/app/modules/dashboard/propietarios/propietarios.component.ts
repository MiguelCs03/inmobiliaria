import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { finalize } from 'rxjs/operators';
import { UploadService } from '../../../core/services/upload.service';

export interface Propietario {
  id: number;
  nombres: string;
  telefono: string;
  ciNit: string;
  activo: boolean;
  fotoUrl?: string;
}

interface PropietariosQueryResponse {
  propietarios: {
    success: boolean;
    message: string;
    data: Propietario[] | null;
  };
}

interface CreatePropietarioMutationResponse {
  createPropietario: {
    success: boolean;
    message: string;
    data: Propietario | null;
  };
}

interface UpdatePropietarioMutationResponse {
  updatePropietario: {
    success: boolean;
    message: string;
    data: Propietario | null;
  };
}

@Component({
  selector: 'app-propietarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './propietarios.component.html',
  styleUrls: ['./propietarios.component.css']
})
export class PropietariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private cdr = inject(ChangeDetectorRef);
  private uploadService = inject(UploadService);

  propietarioForm!: FormGroup;
  propietarios: Propietario[] = [];
  filteredPropietarios: Propietario[] = [];
  
  loadingList = false;
  submitting = false;
  showModal = false;
  showDetailModal = false;
  showToggleConfirm = false;
  isEditing = false;
  selectedPropietario: Propietario | null = null;
  searchQuery = '';

  uploadedFotoUrl: string | null = null;
  uploadingFoto = false;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  private readonly GET_PROPIETARIOS = gql`
    query GetPropietarios($pagination: PaginationInput) {
      propietarios(pagination: $pagination) {
        success
        message
        data {
          id
          nombres
          telefono
          ciNit
          activo
          fotoUrl
        }
      }
    }
  `;

  private readonly CREATE_PROPIETARIO = gql`
    mutation CreatePropietario($input: CreatePropietarioInput!) {
      createPropietario(createPropietarioInput: $input) {
        success
        message
        data {
          id
          nombres
          telefono
          ciNit
          activo
          fotoUrl
        }
      }
    }
  `;

  private readonly UPDATE_PROPIETARIO = gql`
    mutation UpdatePropietario($input: UpdatePropietarioInput!) {
      updatePropietario(updatePropietarioInput: $input) {
        success
        message
        data {
          id
          nombres
          telefono
          ciNit
          activo
          fotoUrl
        }
      }
    }
  `;

  ngOnInit(): void {
    this.initForm();
    this.loadPropietarios();
  }

  private initForm(): void {
    this.propietarioForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9\\+\\-\\s]{7,15}$')]],
      ciNit: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.selectedPropietario = null;
    this.uploadedFotoUrl = null;
    this.uploadingFoto = false;
    this.propietarioForm.reset();
    this.showModal = true;
    this.hideToast();
  }

  editPropietario(prop: Propietario): void {
    this.isEditing = true;
    this.selectedPropietario = prop;
    this.uploadedFotoUrl = prop.fotoUrl || null;
    this.uploadingFoto = false;
    this.propietarioForm.patchValue({
      nombres: prop.nombres,
      telefono: prop.telefono,
      ciNit: prop.ciNit
    });
    this.showModal = true;
    this.hideToast();
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.selectedPropietario = null;
    this.uploadedFotoUrl = null;
    this.uploadingFoto = false;
    this.propietarioForm.reset();
  }

  loadPropietarios(): void {
    this.loadingList = true;
    this.cdr.detectChanges();

    // Consulta unica para evitar suscripciones acumuladas
    this.apollo.query<PropietariosQueryResponse>({
      query: this.GET_PROPIETARIOS,
      variables: { pagination: null },
      fetchPolicy: 'network-only'
    }).pipe(
      finalize(() => {
        this.loadingList = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (result) => {
        const propietariosData = result.data?.propietarios;
        if (propietariosData?.success !== false) {
          this.propietarios = (propietariosData?.data || []) as Propietario[];
          this.applyFilter();
        } else {
          this.showToast(propietariosData?.message || 'Error al obtener propietarios.', 'error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showToast('No se pudo conectar con el servidor. Verifique su conexión.', 'error');
      }
    });
  }

  viewPropietario(prop: Propietario): void {
    this.selectedPropietario = prop;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPropietario = null;
  }

  openToggleConfirm(prop: Propietario): void {
    this.selectedPropietario = prop;
    this.showToggleConfirm = true;
  }

  cancelToggle(): void {
    this.showToggleConfirm = false;
    this.selectedPropietario = null;
  }

  confirmToggle(): void {
    if (!this.selectedPropietario) return;

    const prop = this.selectedPropietario;
    const newState = !prop.activo;
    this.apollo.mutate<UpdatePropietarioMutationResponse>({
      mutation: this.UPDATE_PROPIETARIO,
      variables: { input: { id: prop.id, activo: newState } }
    }).subscribe({
      next: (result) => {
        const res = result.data?.updatePropietario;
        if (res?.success) {
          this.showToast(
            newState ? 'Propietario activado correctamente.' : 'Propietario desactivado correctamente.',
            'success'
          );
          this.cancelToggle();
          this.loadPropietarios();
        } else {
          this.showToast(res?.message || 'Error al cambiar estado del propietario.', 'error');
        }
      },
      error: () => {
        this.showToast('Error de red al intentar cambiar estado.', 'error');
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.uploadingFoto = true;
    this.cdr.detectChanges();

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.uploadingFoto = false;
        if (res.success && res.url) {
          this.uploadedFotoUrl = res.url;
          this.showToast('Foto cargada correctamente.', 'success');
        } else {
          this.showToast(res.message || 'Error al cargar imagen.', 'error');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadingFoto = false;
        console.error('Error uploading profile picture:', err);
        this.showToast('Error de red al subir la imagen. Intente más tarde.', 'error');
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.propietarioForm.invalid) {
      this.propietarioForm.markAllAsTouched();
      return;
    }

    // Evitar crear si falta el id en edicion
    if (this.isEditing && !this.selectedPropietario) {
      this.showToast('No se encontro el propietario a editar.', 'error');
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();
    const input = { ...this.propietarioForm.value, fotoUrl: this.uploadedFotoUrl };

    const isEditing = this.isEditing && !!this.selectedPropietario;

    if (isEditing) {
      // Ruta de actualizacion con tipado separado
      this.apollo.mutate<UpdatePropietarioMutationResponse>({
        mutation: this.UPDATE_PROPIETARIO,
        variables: { input: { id: this.selectedPropietario!.id, ...input } }
      }).pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (result) => {
          const res = result.data?.updatePropietario;
          if (res?.success && res.data) {
            this.showToast('¡Propietario actualizado exitosamente!', 'success');
            this.closeModal();
            this.loadPropietarios();
          } else {
            this.showToast(res?.message || 'Error al actualizar propietario.', 'error');
          }
        },
        error: () => {
          this.showToast('Error de red al intentar actualizar. Intente más tarde.', 'error');
        }
      });
      return;
    }

    // Ruta de creacion con tipado separado
    this.apollo.mutate<CreatePropietarioMutationResponse>({
      mutation: this.CREATE_PROPIETARIO,
      variables: { input }
    }).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (result) => {
        const res = result.data?.createPropietario;
        if (res?.success && res.data) {
          this.showToast('¡Propietario registrado exitosamente!', 'success');
          this.closeModal();
          this.loadPropietarios();
        } else {
          this.showToast(res?.message || 'Error al registrar propietario.', 'error');
        }
      },
      error: () => {
        this.showToast('Error de red al intentar registrar. Intente más tarde.', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.hideToast();
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  private hideToast(): void {
    this.toastVisible = false;
    this.toastMessage = '';
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.cdr.detectChanges();
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery) {
      this.filteredPropietarios = [...this.propietarios];
      return;
    }
    this.filteredPropietarios = this.propietarios.filter(p => 
      p.nombres.toLowerCase().includes(this.searchQuery) ||
      p.ciNit.toLowerCase().includes(this.searchQuery) ||
      p.telefono.toLowerCase().includes(this.searchQuery)
    );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propietarioForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
