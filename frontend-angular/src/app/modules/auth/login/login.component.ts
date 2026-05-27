import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit(): void {
    this.initForm();
    // Si ya está autenticado, redirigir según su rol guardado
    if (this.authService.isAuthenticated()) {
      this.redirectByUserRole(this.authService.getUserRole());
    }
  }

  /**
   * Inicializa el formulario reactivo con validaciones robustas de seguridad.
   */
  private initForm(): void {
    this.loginForm = this.fb.group({
      correo: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  /**
   * Alterna la visibilidad del campo contraseña.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Procesa el envío del formulario de login.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { correo, contrasenia } = this.loginForm.value;

    this.authService.login({ correo, contrasenia }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        // Restablecemos el estado de carga inmediatamente al recibir respuesta del servidor
        this.loading = false;
        if (response.success && response.data) {
          const rolId = response.data.usuario.rolId;
          this.redirectByUserRole(rolId);
        } else {
          // Asignamos el mensaje descriptivo devuelto por el backend
          this.errorMessage = response.message || 'Credenciales inválidas. Por favor intente de nuevo.';
        }
      },
      error: (err) => {
        // En caso de error de red o error devuelto por Apollo/GraphQL, restablecemos el spinner
        this.loading = false;
        if (err.message?.includes('Credenciales') || err.message?.includes('invalida')) {
          this.errorMessage = err.message;
        } else if (err.status === 0 || err.message?.includes('Failed to fetch')) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
        } else {
          this.errorMessage = 'Error en el proceso de autenticación. Intente más tarde.';
        }
      }
    });
  }

  /**
   * Redirige al usuario a su panel correspondiente en base a su rol administrativo.
   */
  private redirectByUserRole(rolId: number | null): void {
    if (rolId === 1) {
      this.router.navigate(['/admin/dashboard']);
    } else if (rolId === 2) {
      this.router.navigate(['/agente/visitas']);
    } else {
      this.errorMessage = 'Acceso restringido. Su cuenta no cuenta con un rol de personal autorizado.';
      this.authService.logout();
    }
  }

  // Helpers rápidos para validación visual en el template
  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
