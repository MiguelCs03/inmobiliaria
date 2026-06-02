import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/landing/landing.page').then(m => m.LandingComponent)
      },
      {
        path: 'quienes-somos',
        loadComponent: () => import('./pages/quienes-somos/quienes-somos.page').then(m => m.QuienesSomosPage)
      },
      {
        path: 'propiedades/:id',
        loadComponent: () => import('./pages/propiedad-detalle/propiedad-detalle.page').then(m => m.PropiedadDetalleComponent)
      }
    ]
  }
];
