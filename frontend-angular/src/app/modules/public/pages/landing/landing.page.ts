import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // 👇 UPDATE THESE TWO LINES 👇
  templateUrl: './landing.page.html', // Change to .page.html
  styleUrls: ['./landing.page.css']    // Change to .page.css
  // 👆 UPDATE THESE TWO LINES 👆
})
export class LandingComponent implements OnInit {
  
  // Variables para el buscador rápido
  filtroTipoPropiedad: string = '';
  filtroTipoOperacion: string = 'ALQUILER';
  filtroUbicacion: string = '';

  // Datos mockeados para mostrar algo visual de entrada
  propiedadesDestacadas = [
    {
      id: 1,
      titulo: 'Hermoso Departamento de Estreno',
      ubicacion: 'Equipetrol, Santa Cruz',
      precio: 450,
      tipoOperacion: 'ALQUILER',
      area: 75,
      habitaciones: 2,
      imagen: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 2,
      titulo: 'Casa Familiar con Piscina',
      ubicacion: 'Zona Norte, Av. Banzer',
      precio: 180000,
      tipoOperacion: 'VENTA',
      area: 280,
      habitaciones: 4,
      imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 3,
      titulo: 'Monoambiente Amoblado',
      ubicacion: 'Barrio Sirari',
      precio: 350,
      tipoOperacion: 'ALQUILER',
      area: 45,
      habitaciones: 1,
      imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop&q=60'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  buscar(): void {
    // Redirecciona al catálogo pasando los filtros por parámetros de URL (QueryParams)
    this.router.navigate(['/propiedades'], {
      queryParams: {
        tipo: this.filtroTipoPropiedad,
        operacion: this.filtroTipoOperacion,
        ubicacion: this.filtroUbicacion
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/propiedades', id]);
  }
}