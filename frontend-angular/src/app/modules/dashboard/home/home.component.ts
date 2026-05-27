import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userRole: number | null = null;
  roleName = '';

  metrics = [
    { title: 'Propiedades Totales', value: '142', icon: 'home', change: '+12% este mes' },
    { title: 'Propietarios Afiliados', value: '48', icon: 'users', change: '+4 esta semana' },
    { title: 'Contratos Firmados', value: '18', icon: 'document', change: '8 Activos' },
    { title: 'Visitas Agendadas', value: '29', icon: 'calendar', change: '6 para hoy' }
  ];

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.roleName = this.userRole === 1 ? 'Administrador' : 'Agente Inmobiliario';
  }

  navigateTo(module: string): void {
    const prefix = this.userRole === 1 ? '/admin' : '/agente';
    this.router.navigate([`${prefix}/${module}`]);
  }
}
