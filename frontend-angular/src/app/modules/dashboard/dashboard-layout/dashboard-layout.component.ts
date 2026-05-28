import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userRole: number | null = null;
  userEmail = 'usuario@inmobiliaria.com';
  roleName = '';
  sidebarCollapsed = false;
  userMenuOpen = false;
  isDarkMode = false; // Control de estado para el tema oscuro (Luna/Sol)

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  // Getters reactivos para sincronización en tiempo real con localStorage
  get userName(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const firstName = localStorage.getItem('user_name');
      const lastName = localStorage.getItem('user_lastname');
      if (firstName) {
        return `${firstName} ${lastName || ''}`.trim();
      }
    }
    return this.userRole === 1 ? 'Administrador' : 'Agente Inmobiliario';
  }

  get userPhoto(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const photo = localStorage.getItem('user_photo');
      if (photo) return photo;
    }
    return '';
  }

  get userEmailDisplay(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      const email = localStorage.getItem('user_email');
      if (email) return email;
    }
    return this.userEmail;
  }

  ngOnInit(): void {
    // La proteccion de rutas se maneja en guards
    this.userRole = this.authService.getUserRole();
    this.roleName = this.userRole === 1 ? 'Administrador' : 'Agente Inmobiliario';

    // Recuperamos y aplicamos el tema oscuro guardado en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
      if (this.isDarkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }
  }

  /**
   * Alterna dinámicamente entre modo claro y oscuro.
   * Persiste la configuración del usuario en localStorage y añade la clase `.dark` al body.
   */
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (this.isDarkMode) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  }

  logout(): void {
    // Limpiar sesión y redirigir
    this.authService.logout();
    this.closeUserMenu();
    this.router.navigate(['/intranet']);
  }

  getDashboardRoute(): string {
    return this.userRole === 1 ? '/admin/dashboard' : '/agente/visitas';
  }
}
