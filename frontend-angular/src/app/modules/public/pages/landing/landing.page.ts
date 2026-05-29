import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';

interface PropiedadImagen {
  id: number;
  urlS3: string;
}

interface Propiedad {
  id: number;
  propietarioId: number;
  tipoPropiedadId: number;
  tipoOperacionId: number;
  estadoPropiedadId: number;
  precioBase: number;
  areaM2: number;
  ubicacion: string | null;
  imagenes?: PropiedadImagen[] | null;
}

interface PropiedadesQueryResponse {
  propiedades: {
    success: boolean;
    message: string;
    data: Propiedad[] | null;
  };
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // 👇 UPDATE THESE TWO LINES 👇
  templateUrl: './landing.page.html', // Change to .page.html
  styleUrls: ['./landing.page.css']    // Change to .page.css
  // 👆 UPDATE THESE TWO LINES 👆
})
export class LandingComponent implements AfterViewInit {
  private apollo = inject(Apollo);
  
  // Variables para el buscador rapido
  filtroTipoPropiedad: string = '';
  filtroTipoOperacion: string = 'ALQUILER';
  filtroUbicacion: string = '';

  propiedades: Propiedad[] = [];
  propiedadesFiltradas: Propiedad[] = [];

  loadingList = false;
  errorMessage = '';

  currentPage = 1;
  readonly pageSize = 12;
  hasMore = true;

  readonly defaultImageUrl =
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=500&auto=format&fit=crop&q=60';

  tiposPropiedad = [
    { id: 1, nombre: 'Casa' },
    { id: 2, nombre: 'Departamento' },
    { id: 3, nombre: 'Terreno' },
    { id: 4, nombre: 'Oficina' }
  ];

  tiposOperacion = [
    { id: 1, nombre: 'VENTA' },
    { id: 2, nombre: 'ALQUILER' }
  ];

  private readonly GET_PROPIEDADES = gql`
    query GetPropiedades($pagination: PaginationInput) {
      propiedades(pagination: $pagination) {
        success
        message
        data {
          id
          propietarioId
          tipoPropiedadId
          tipoOperacionId
          estadoPropiedadId
          precioBase
          areaM2
          ubicacion
          imagenes {
            id
            urlS3
          }
        }
      }
    }
  `;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    setTimeout(() => this.loadPropiedades(1), 0);
  }

  buscar(): void {
    this.applyFilters();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/propiedades', id]);
  }

  loadPropiedades(page: number): void {
    this.loadingList = true;
    this.errorMessage = '';
    this.apollo
      .query<PropiedadesQueryResponse>({
        query: this.GET_PROPIEDADES,
        variables: {
          pagination: {
            page,
            limit: this.pageSize
          }
        },
        fetchPolicy: 'network-only'
      })
      .subscribe({
        next: (result) => {
          setTimeout(() => {
            this.loadingList = false;
            if (result.data?.propiedades?.success === false) {
              this.errorMessage = result.data.propiedades.message || 'Error al cargar propiedades.';
              this.propiedades = [];
              this.propiedadesFiltradas = [];
              return;
            }

            const data = (result.data?.propiedades?.data || []) as Propiedad[];
            this.propiedades = data;
            this.currentPage = page;
            this.hasMore = data.length === this.pageSize;
            this.applyFilters();
          }, 0);
        },
        error: () => {
          setTimeout(() => {
            this.loadingList = false;
            this.errorMessage = 'No se pudo conectar con el servidor.';
            this.propiedades = [];
            this.propiedadesFiltradas = [];
          }, 0);
        }
      });
  }

  applyFilters(): void {
    const operacionId = this.getTipoOperacionId(this.filtroTipoOperacion);
    const tipoPropiedadId = this.getTipoPropiedadId(this.filtroTipoPropiedad);
    const filtroUbicacion = this.filtroUbicacion.trim().toLowerCase();

    this.propiedadesFiltradas = this.propiedades.filter((propiedad) => {
      if (propiedad.estadoPropiedadId !== 1) {
        return false;
      }

      if (operacionId && propiedad.tipoOperacionId !== operacionId) {
        return false;
      }

      if (tipoPropiedadId && propiedad.tipoPropiedadId !== tipoPropiedadId) {
        return false;
      }

      if (filtroUbicacion) {
        const ubicacion = (propiedad.ubicacion || '').toLowerCase();
        if (!ubicacion.includes(filtroUbicacion)) {
          return false;
        }
      }

      return true;
    });
  }

  nextPage(): void {
    if (this.hasMore && !this.loadingList) {
      this.loadPropiedades(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1 && !this.loadingList) {
      this.loadPropiedades(this.currentPage - 1);
    }
  }

  getImagenUrl(propiedad: Propiedad): string {
    if (propiedad.imagenes && propiedad.imagenes.length > 0) {
      return propiedad.imagenes[0].urlS3;
    }
    return this.defaultImageUrl;
  }

  getTipoOperacionNombre(id: number): string {
    return this.tiposOperacion.find((tipo) => tipo.id === id)?.nombre || 'OPERACION';
  }

  getTipoPropiedadNombre(id: number): string {
    return this.tiposPropiedad.find((tipo) => tipo.id === id)?.nombre || 'Propiedad';
  }

  getPropiedadTitulo(propiedad: Propiedad): string {
    const tipo = this.getTipoPropiedadNombre(propiedad.tipoPropiedadId);
    const ubicacion = propiedad.ubicacion ? ` en ${propiedad.ubicacion}` : '';
    return `${tipo}${ubicacion}`;
  }

  private getTipoOperacionId(operacion: string): number | null {
    const normalizada = operacion.trim().toUpperCase();
    const match = this.tiposOperacion.find((tipo) => tipo.nombre === normalizada);
    return match ? match.id : null;
  }

  private getTipoPropiedadId(tipoPropiedad: string): number | null {
    const normalizada = tipoPropiedad.trim().toUpperCase();
    const match = this.tiposPropiedad.find((tipo) => tipo.nombre.toUpperCase() === normalizada);
    return match ? match.id : null;
  }
}