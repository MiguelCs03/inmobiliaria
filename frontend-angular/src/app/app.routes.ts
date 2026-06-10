import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // 1. RUTAS PÚBLICAS (Cliente - No Auth)
  // Ahora la ruta vacía cargará tu módulo público (Landing, Catálogo...)
  {
    path: '',
    loadChildren: () => import('./modules/public/public.routes').then(m => m.PUBLIC_ROUTES)
  },

  // 2. RUTAS DE INTRANET / AUTH (Login y Dashboard)
  {
    path: 'intranet',
    canActivate: [guestGuard],
    loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Rutas de Intranet para Administrador
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/home/home.component').then(m => m.HomeComponent) },
      { path: 'propietarios', loadComponent: () => import('./modules/dashboard/propietarios/propietarios.component').then(m => m.PropietariosComponent) },
      { path: 'agentes', loadComponent: () => import('./modules/dashboard/agentes/agentes.component').then(m => m.AgentesComponent) },
      { path: 'propiedades', loadComponent: () => import('./modules/dashboard/propiedades/propiedades.component').then(m => m.PropiedadesComponent) },
      { path: 'visitas', loadComponent: () => import('./modules/dashboard/visitas/visitas.component').then(m => m.VisitasComponent) },
      { path: 'contratos', loadComponent: () => import('./modules/dashboard/contratos/contratos-lista/contratos-lista.component').then(m => m.ContractosListaComponent) },
      { path: 'contrato-nuevo', loadComponent: () => import('./modules/dashboard/contratos/contrato-nuevo/contrato-nuevo.component').then(m => m.ContratoNuevoComponent) },
      { path: 'contratos/:id', loadComponent:()=> import('./modules/dashboard/contratos/contrato-detalle/contrato-detalle.component').then(m=>m.ContratoDetalleComponent)},
      { path: 'perfil', loadComponent: () => import('./modules/dashboard/perfil/perfil.component').then(m => m.PerfilComponent) }
    ]
  },

  // Rutas de Intranet para Agente
  {
    path: 'agente',
    canActivate: [authGuard],
    loadComponent: () => import('./modules/dashboard/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/home/home.component').then(m => m.HomeComponent) },
      { path: 'visitas', loadComponent: () => import('./modules/dashboard/visitas/visitas.component').then(m => m.VisitasComponent) },
      { path: 'propietarios', loadComponent: () => import('./modules/dashboard/propietarios/propietarios.component').then(m => m.PropietariosComponent) },
      { path: 'propiedades', loadComponent: () => import('./modules/dashboard/propiedades/propiedades.component').then(m => m.PropiedadesComponent) },
      { path: 'perfil', loadComponent: () => import('./modules/dashboard/perfil/perfil.component').then(m => m.PerfilComponent) }
    ]
  },

  // 3. RUTAS NO ENCONTRADAS (404)
  // Ahora, cualquier ruta desconocida redirigirá a la raíz pública
  {
    path: '**',
    redirectTo: ''
  }
];