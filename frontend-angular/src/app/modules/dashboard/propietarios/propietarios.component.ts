import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';

export interface Propietario {
  id: number;
  nombres: string;
  telefono: string;
  ciNit: string;
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

  propietarioForm!: FormGroup;
  propietarios: Propietario[] = [];
  filteredPropietarios: Propietario[] = [];
  
  loadingList = false;
  submitting = false;
  showModal = false;
  searchQuery = '';

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
    this.showModal = true;
    this.hideToast();
  }

  closeModal(): void {
    this.showModal = false;
    this.propietarioForm.reset();
  }

  loadPropietarios(): void {
    this.loadingList = true;

    this.apollo.watchQuery<PropietariosQueryResponse>({
      query: this.GET_PROPIETARIOS,
      variables: { pagination: null },
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        this.loadingList = false;
        const propietariosData = result.data?.propietarios;
        if (propietariosData?.success !== false) {
          this.propietarios = (propietariosData?.data || []) as Propietario[];
          this.applyFilter();
        } else {
          this.showToast(propietariosData?.message || 'Error al obtener propietarios.', 'error');
        }
      },
      error: (err) => {
        this.loadingList = false;
        console.error('Error loading owners:', err);
        this.showToast('No se pudo conectar con el servidor. Verifique su conexión.', 'error');
      }
    });
  }

  onSubmit(): void {
    if (this.propietarioForm.invalid) {
      this.propietarioForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const input = this.propietarioForm.value;

    this.apollo.mutate<CreatePropietarioMutationResponse>({
      mutation: this.CREATE_PROPIETARIO,
      variables: { input }
    }).subscribe({
      next: (result) => {
        this.submitting = false;
        const res = result.data?.createPropietario;
        if (res?.success && res.data) {
          this.showToast('¡Propietario registrado exitosamente!', 'success');
          this.closeModal();
          this.loadPropietarios();
        } else {
          this.showToast(res?.message || 'Error al registrar propietario.', 'error');
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating owner:', err);
        this.showToast('Error de red al intentar registrar. Intente más tarde.', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.hideToast();
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.toastTimeout = setTimeout(() => this.hideToast(), 4000);
  }

  private hideToast(): void {
    this.toastVisible = false;
    this.toastMessage = '';
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
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
