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
  // Rutas de Intranet para Administrador
  {
    path: 'admin',
    loadComponent: () => import('./modules/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/home/home.component').then(m => m.HomeComponent) },
      { path: 'propietarios', loadComponent: () => import('./modules/dashboard/propietarios/propietarios.component').then(m => m.PropietariosComponent) },
      { path: 'propiedades', loadComponent: () => import('./modules/dashboard/propiedades/propiedades.component').then(m => m.PropiedadesComponent) }
    ]
  },
  // Rutas de Intranet para Agente
  {
    path: 'agente',
    loadComponent: () => import('./modules/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'visitas', pathMatch: 'full' },
      { path: 'visitas', loadComponent: () => import('./modules/dashboard/home/home.component').then(m => m.HomeComponent) },
      { path: 'propietarios', loadComponent: () => import('./modules/dashboard/propietarios/propietarios.component').then(m => m.PropietariosComponent) },
      { path: 'propiedades', loadComponent: () => import('./modules/dashboard/propiedades/propiedades.component').then(m => m.PropiedadesComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: 'intranet'
  }
];
