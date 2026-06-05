import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { finalize, switchMap } from 'rxjs/operators';

export interface Agente {
  id: number;
  nombres: string;
  apellidos: string;
  activo: boolean;
}

interface Rol { id: number; nombre: string; }
interface Sucursal { id: number; nombre: string; ciudad: string; activo: boolean; }

interface EmpleadosQueryResponse { empleados: { success: boolean; message: string; data: Agente[] | null }; }
interface RolesQueryResponse { roles: { success: boolean; message: string; data: Rol[] | null }; }
interface SucursalesQueryResponse { sucursales: { success: boolean; message: string; data: Sucursal[] | null }; }
interface RegisterMutationResponse { register: { success: boolean; message: string; data: { id: number; correo: string; rolId: number } | null }; }
interface CreateEmpleadoMutationResponse { createEmpleado: { success: boolean; message: string; data: Agente | null }; }
interface UpdateEmpleadoMutationResponse { updateEmpleado: { success: boolean; message: string; data: Agente | null }; }

@Component({
  selector: 'app-agentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agentes.component.html',
  styleUrls: ['./agentes.component.css']
})
export class AgentesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private cdr = inject(ChangeDetectorRef);

  agenteForm!: FormGroup;
  agentes: Agente[] = [];
  filteredAgentes: Agente[] = [];
  roles: Rol[] = [];
  sucursales: Sucursal[] = [];

  loadingList = false;
  submitting = false;
  creatingUser = false;
  showModal = false;
  showDetailModal = false;
  showToggleConfirm = false;
  isEditing = false;
  showPassword = false;
  selectedAgente: Agente | null = null;
  searchQuery = '';

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout: any = null;

  private readonly GET_EMPLEADOS = gql`
    query GetEmpleados($pagination: PaginationInput) {
      empleados(pagination: $pagination) {
        success message data { id nombres apellidos activo }
      }
    }
  `;

  private readonly GET_ROLES = gql`
    query GetRoles {
      roles { success message data { id nombre } }
    }
  `;

  private readonly GET_SUCURSALES = gql`
    query GetSucursales {
      sucursales { success message data { id nombre ciudad activo } }
    }
  `;

  private readonly REGISTER_USUARIO = gql`
    mutation RegisterUsuario($input: RegisterUsuarioInput!) {
      register(registerUsuarioInput: $input) {
        success message data { id correo rolId }
      }
    }
  `;

  private readonly CREATE_EMPLEADO = gql`
    mutation CreateEmpleado($input: CreateEmpleadoInput!) {
      createEmpleado(createEmpleadoInput: $input) {
        success message data { id nombres apellidos activo }
      }
    }
  `;

  private readonly UPDATE_EMPLEADO = gql`
    mutation UpdateEmpleado($input: UpdateEmpleadoInput!) {
      updateEmpleado(updateEmpleadoInput: $input) {
        success message data { id nombres apellidos activo }
      }
    }
  `;

  ngOnInit(): void {
    this.initForm();
    this.loadAgentes();
    this.loadRoles();
    this.loadSucursales();
  }

  private initForm(): void {
    this.agenteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.email]],
      contrasenia: [''],
      rolId: [null],
      sucursalId: [null, Validators.required]
    });
  }

  private setCreateValidators(): void {
    this.agenteForm.get('correo')?.setValidators([Validators.required, Validators.email]);
    this.agenteForm.get('contrasenia')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.agenteForm.get('rolId')?.setValidators(Validators.required);
    this.agenteForm.get('sucursalId')?.setValidators(Validators.required);
    Object.keys(this.agenteForm.controls).forEach(k => this.agenteForm.get(k)?.updateValueAndValidity());
  }

  private clearEditValidators(): void {
    ['correo', 'contrasenia', 'rolId', 'sucursalId'].forEach(f => {
      this.agenteForm.get(f)?.clearValidators();
      this.agenteForm.get(f)?.updateValueAndValidity();
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.selectedAgente = null;
    this.showPassword = false;
    this.agenteForm.reset();
    this.setCreateValidators();
    this.showModal = true;
    this.hideToast();
  }

  editAgente(agente: Agente): void {
    this.isEditing = true;
    this.selectedAgente = agente;
    this.showPassword = false;
    this.agenteForm.reset();
    this.clearEditValidators();
    this.agenteForm.patchValue({ nombres: agente.nombres, apellidos: agente.apellidos });
    this.showModal = true;
    this.hideToast();
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.selectedAgente = null;
    this.creatingUser = false;
    this.agenteForm.reset();
  }

  loadAgentes(): void {
    this.loadingList = true;
    this.cdr.detectChanges();
    this.apollo.query<EmpleadosQueryResponse>({
      query: this.GET_EMPLEADOS,
      variables: { pagination: null },
      fetchPolicy: 'network-only'
    }).pipe(finalize(() => { this.loadingList = false; this.cdr.detectChanges(); })).subscribe({
      next: (result) => {
        const data = result.data?.empleados;
        if (data?.success !== false) {
          this.agentes = (data?.data || []) as Agente[];
          this.applyFilter();
        } else { this.showToast(data?.message || 'Error al obtener agentes.', 'error'); }
      },
      error: () => { this.showToast('No se pudo conectar con el servidor.', 'error'); }
    });
  }

  loadRoles(): void {
    this.apollo.query<RolesQueryResponse>({ query: this.GET_ROLES, fetchPolicy: 'network-only' }).subscribe({
      next: (result) => { this.roles = (result.data?.roles?.data || []) as Rol[]; }
    });
  }

  loadSucursales(): void {
    this.apollo.query<SucursalesQueryResponse>({ query: this.GET_SUCURSALES, fetchPolicy: 'network-only' }).subscribe({
      next: (result) => { this.sucursales = (result.data?.sucursales?.data || []) as Sucursal[]; }
    });
  }

  viewAgente(agente: Agente): void { this.selectedAgente = agente; this.showDetailModal = true; }
  closeDetailModal(): void { this.showDetailModal = false; this.selectedAgente = null; }
  openToggleConfirm(agente: Agente): void { this.selectedAgente = agente; this.showToggleConfirm = true; }
  cancelToggle(): void { this.showToggleConfirm = false; this.selectedAgente = null; }

  confirmToggle(): void {
    if (!this.selectedAgente) return;
    const agente = this.selectedAgente;
    const newState = !agente.activo;
    this.apollo.mutate<UpdateEmpleadoMutationResponse>({
      mutation: this.UPDATE_EMPLEADO,
      variables: { input: { id: agente.id, activo: newState } }
    }).subscribe({
      next: (result) => {
        if (result.data?.updateEmpleado?.success) {
          this.showToast(newState ? 'Agente activado correctamente.' : 'Agente desactivado correctamente.', 'success');
          this.cancelToggle();
          this.loadAgentes();
        } else { this.showToast(result.data?.updateEmpleado?.message || 'Error al cambiar estado.', 'error'); }
      },
      error: () => { this.showToast('Error de red.', 'error'); }
    });
  }

  togglePassword(): void { this.showPassword = !this.showPassword; }

  onSubmit(): void {
    if (this.agenteForm.invalid) { this.agenteForm.markAllAsTouched(); return; }
    this.submitting = true;
    this.cdr.detectChanges();
    const formVal = this.agenteForm.value;

    if (this.isEditing) {
      const payload: any = { id: this.selectedAgente!.id, nombres: formVal.nombres, apellidos: formVal.apellidos };
      this.apollo.mutate<UpdateEmpleadoMutationResponse>({
        mutation: this.UPDATE_EMPLEADO,
        variables: { input: payload }
      }).pipe(finalize(() => { this.submitting = false; this.cdr.detectChanges(); })).subscribe({
        next: (result) => {
          if (result.data?.updateEmpleado?.success) {
            this.showToast('Agente actualizado exitosamente.', 'success');
            this.closeModal();
            this.loadAgentes();
          } else { this.showToast(result.data?.updateEmpleado?.message || 'Error al actualizar.', 'error'); }
        },
        error: () => { this.showToast('Error de red.', 'error'); }
      });
      return;
    }

    this.creatingUser = true;
    this.cdr.detectChanges();

    this.apollo.mutate<RegisterMutationResponse>({
      mutation: this.REGISTER_USUARIO,
      variables: { input: { correo: formVal.correo, contrasenia: formVal.contrasenia, rolId: formVal.rolId } }
    }).pipe(
      switchMap((regResult) => {
        const reg = regResult.data?.register;
        if (!reg?.success || !reg.data) {
          throw new Error(reg?.message || 'Error al crear usuario.');
        }
        this.creatingUser = false;
        this.cdr.detectChanges();
        return this.apollo.mutate<CreateEmpleadoMutationResponse>({
          mutation: this.CREATE_EMPLEADO,
          variables: { input: { usuarioId: reg.data.id, sucursalId: formVal.sucursalId, nombres: formVal.nombres, apellidos: formVal.apellidos } }
        });
      }),
      finalize(() => { this.submitting = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (empResult) => {
        if (empResult.data?.createEmpleado?.success && empResult.data?.createEmpleado?.data) {
          this.showToast('Agente registrado exitosamente.', 'success');
          this.closeModal();
          this.loadAgentes();
        } else {
          this.showToast(empResult.data?.createEmpleado?.message || 'Error al registrar agente.', 'error');
        }
      },
      error: (err) => {
        this.creatingUser = false;
        this.showToast(err?.message || 'Error al crear empleado.', 'error');
      }
    });
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.hideToast();
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();
    this.toastTimeout = setTimeout(() => this.hideToast(), 4000);
  }

  private hideToast(): void {
    this.toastVisible = false;
    this.toastMessage = '';
    if (this.toastTimeout) { clearTimeout(this.toastTimeout); this.toastTimeout = null; }
    this.cdr.detectChanges();
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilter();
  }

  private applyFilter(): void {
    if (!this.searchQuery) { this.filteredAgentes = [...this.agentes]; return; }
    this.filteredAgentes = this.agentes.filter(a =>
      a.nombres.toLowerCase().includes(this.searchQuery) ||
      a.apellidos.toLowerCase().includes(this.searchQuery)
    );
  }

  isFieldInvalid(field: string): boolean {
    const control = this.agenteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get f(): { [key: string]: AbstractControl } { return this.agenteForm.controls; }
}
