import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.page';

// Definimos y exportamos las rutas públicas como una constante Standalone
export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    // Cargamos el componente LandingPage que acabas de crear
    loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingComponent)
  },
  {
    path: 'propiedades/:id',
    loadComponent: () => import('./pages/propiedad-detalle/propiedad-detalle.page').then(m => m.PropiedadDetalleComponent)
  }
  // En el futuro añadirás aquí el catálogo y el detalle:
  // { path: 'propiedades', loadComponent: () => ... },
  // { path: 'propiedades/:id', loadComponent: () => ... }
];