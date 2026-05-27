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

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/intranet']);
      return;
    }

    this.userRole = this.authService.getUserRole();
    this.roleName = this.userRole === 1 ? 'Administrador' : 'Agente Inmobiliario';
    
    // Extraer correo de almacenamiento o de forma básica
    if (typeof window !== 'undefined' && window.localStorage) {
      // Intenta leer si hay algún correo guardado
      const savedEmail = localStorage.getItem('user_email');
      if (savedEmail) {
        this.userEmail = savedEmail;
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/intranet']);
  }

  getDashboardRoute(): string {
    return this.userRole === 1 ? '/admin/dashboard' : '/agente/visitas';
  }
}
