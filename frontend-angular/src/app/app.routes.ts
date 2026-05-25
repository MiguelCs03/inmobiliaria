import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'intranet',
    pathMatch: 'full'
  },
  {
    path: 'intranet',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },
  // Rutas protegidas de destino para Administrador y Agente (Ejemplos/Placeholders)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) // Opcional o placeholder
  },
  {
    path: 'agente/visitas',
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) // Opcional o placeholder
  }
];
