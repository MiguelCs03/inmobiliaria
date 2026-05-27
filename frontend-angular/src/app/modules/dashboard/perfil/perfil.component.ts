import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Formularios reactivos independientes
  personalForm!: FormGroup;
  passwordForm!: FormGroup;

  // Estados de carga e interacción
  loadingPersonal = false;
  loadingPassword = false;
  
  successMessagePersonal = '';
  errorMessagePersonal = '';
  successMessagePassword = '';
  errorMessagePassword = '';

  // Datos de cuenta y sesión
  userId = '';
  userEmail = '';
  roleName = '';
  userPhoto = '';

  // Getter reactivo para sincronizar el nombre de pila en tiempo real
  get userName(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const firstName = localStorage.getItem('user_name');
      const lastName = localStorage.getItem('user_lastname');
      if (firstName) {
        return `${firstName} ${lastName || ''}`.trim();
      }
    }
    return this.roleName;
  }

  ngOnInit(): void {
    // Obtener datos base desde authService
    this.userId = this.authService.getUserId() || '0';
    this.userEmail = this.authService.getUserEmail() || 'usuario@inmobiliaria.com';
    const roleId = this.authService.getUserRole();
    this.roleName = roleId === 1 ? 'Administrador' : 'Agente Inmobiliario';

    this.initForms();
    this.loadUserData();
  }

  /**
   * Inicializa formularios con sus respectivas reglas de validación.
   */
  private initForms(): void {
    // Formulario de datos personales
    this.personalForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.pattern('^[0-9\\+\\-\\s]{7,15}$')]]
    });

    // Formulario de cambio de contraseña
    this.passwordForm = this.fb.group({
      nuevaContrasenia: ['', [Validators.required, Validators.minLength(6)]],
      confirmarContrasenia: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * Validador personalizado para asegurar que las contraseñas coincidan.
   */
  private passwordMatchValidator(form: FormGroup) {
    const nueva = form.get('nuevaContrasenia')?.value;
    const confirmar = form.get('confirmarContrasenia')?.value;
    return nueva === confirmar ? null : { mismatch: true };
  }

  /**
   * Carga los datos complementarios del perfil desde localStorage.
   */
  private loadUserData(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const nombres = localStorage.getItem('user_name') || '';
      const apellidos = localStorage.getItem('user_lastname') || '';
      const telefono = localStorage.getItem('user_phone') || '';
      this.userPhoto = localStorage.getItem('user_photo') || '';

      this.personalForm.patchValue({
        nombres,
        apellidos,
        telefono
      });
    }
  }

  /**
   * Procesa la subida y simulación de la foto de perfil.
   * Se lee el archivo como Base64 para visualizarlo inmediatamente.
   */
  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validación básica de tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.errorMessagePersonal = 'Por favor, selecciona un archivo de imagen válido.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.userPhoto = base64String;

      if (typeof window !== 'undefined' && window.localStorage) {
        // Persistir localmente en base64 para que se refleje por toda la intranet al instante
        localStorage.setItem('user_photo', base64String);
      }

      /* 
         ======================================================================
         NOTA PARA IMPLEMENTACIÓN DE CLOUDINARY POSTERIOR:
         ======================================================================
         Aquí se realizará la petición HTTP POST enviando el archivo 'file' 
         o su base64 a tu API Gateway (microservicio de documentos o gestión) 
         para subirlo a Cloudinary, guardando el URL resultante (secure_url) 
         en la base de datos a través de una mutación.
         
         Ejemplo conceptual:
         this.propiedadService.uploadImage(file).subscribe(url => {
           this.savePhotoUrlOnDatabase(url);
         });
         ======================================================================
      */
      this.successMessagePersonal = 'Imagen de perfil cargada localmente (pendiente Cloudinary).';
      setTimeout(() => this.successMessagePersonal = '', 4000);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Guarda los datos personales del usuario.
   */
  onSubmitPersonal(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    this.loadingPersonal = true;
    this.successMessagePersonal = '';
    this.errorMessagePersonal = '';

    const { nombres, apellidos, telefono } = this.personalForm.value;

    setTimeout(() => {
      this.loadingPersonal = false;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('user_name', nombres);
        localStorage.setItem('user_lastname', apellidos);
        localStorage.setItem('user_phone', telefono);
      }
      this.successMessagePersonal = 'Datos personales actualizados correctamente.';
      setTimeout(() => this.successMessagePersonal = '', 4000);
    }, 600);
  }

  /**
   * Cambia la contraseña llamando a la mutación de GraphQL en el backend.
   */
  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.loadingPassword = true;
    this.successMessagePassword = '';
    this.errorMessagePassword = '';

    const { nuevaContrasenia } = this.passwordForm.value;
    const numericId = parseInt(this.userId, 10);

    this.authService.cambiarContrasenia(numericId, nuevaContrasenia).subscribe({
      next: (response) => {
        this.loadingPassword = false;
        if (response.success) {
          this.successMessagePassword = 'Contraseña actualizada correctamente en el sistema.';
          this.passwordForm.reset();
          setTimeout(() => this.successMessagePassword = '', 4000);
        } else {
          this.errorMessagePassword = response.message || 'No se pudo cambiar la contraseña.';
        }
      },
      error: (err) => {
        this.loadingPassword = false;
        console.error('Error al cambiar contraseña:', err);
        this.errorMessagePassword = 'Error de red o de comunicación con el Gateway. Intenta más tarde.';
      }
    });
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
