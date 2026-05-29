import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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

interface PropiedadResponse {
  propiedad: {
    success: boolean;
    message: string;
    data: Propiedad | null;
  };
}

@Component({
  selector: 'app-propiedad-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './propiedad-detalle.page.html',
  styleUrls: ['./propiedad-detalle.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropiedadDetalleComponent implements OnInit {

  private apollo = inject(Apollo);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  propiedad?: Propiedad;

  loading = true;
  errorMessage = '';

  imagenes: string[] = [];
  mainImageUrl = '';

  titulo = '';
  tipoOperacionNombre = '';
  tipoPropiedadNombre = '';
  estadoPropiedadNombre = '';
  ubicacionTexto = '';

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

  estadosPropiedad = [
    { id: 1, nombre: 'Disponible' },
    { id: 2, nombre: 'Reservado' },
    { id: 3, nombre: 'Vendido' }
  ];

  private readonly GET_PROPIEDAD = gql`
    query GetPropiedad($id: Int!) {
      propiedad(id: $id) {
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

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      console.log('[detalle] paramMap id:', id, 'raw:', params.get('id'));

      this.loading = true;
      this.errorMessage = '';
      this.propiedad = undefined;
      this.cdr.markForCheck();

      if (!id || Number.isNaN(id)) {
        this.loading = false;
        this.errorMessage = 'ID de propiedad inválido.';
        this.cdr.markForCheck();
        return;
      }

      this.loadPropiedad(id);
    });
  }

  loadPropiedad(id: number): void {
    console.log('[detalle] loadPropiedad start:', id);
    this.apollo
      .query<PropiedadResponse>({
        query: this.GET_PROPIEDAD,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      .subscribe({
        next: (result) => {
          setTimeout(() => {
            console.log('[detalle] response:', result);
            const response = result.data?.propiedad;

            if (!response?.success || !response.data) {
              this.loading = false;
              this.errorMessage =
                response?.message || 'No se pudo cargar la propiedad.';
              console.warn('[detalle] error response:', response);
              this.cdr.markForCheck();
              return;
            }

            this.propiedad = response.data;

            this.imagenes =
              this.propiedad.imagenes?.length
                ? this.propiedad.imagenes.map((img) => img.urlS3)
                : [this.defaultImageUrl];

            this.mainImageUrl = this.imagenes[0];

            this.tipoOperacionNombre =
              this.getTipoOperacionNombre(this.propiedad.tipoOperacionId);

            this.tipoPropiedadNombre =
              this.getTipoPropiedadNombre(this.propiedad.tipoPropiedadId);

            this.estadoPropiedadNombre =
              this.getEstadoPropiedadNombre(this.propiedad.estadoPropiedadId);

            this.ubicacionTexto =
              this.propiedad.ubicacion || 'Sin ubicación registrada';

            this.titulo =
              `${this.tipoPropiedadNombre}${this.propiedad.ubicacion ? ' en ' + this.propiedad.ubicacion : ''}`;

            this.loading = false;
            console.log('[detalle] view model set:', {
              id: this.propiedad.id,
              imagenes: this.imagenes.length,
              titulo: this.titulo
            });
            this.cdr.markForCheck();
          }, 0);
        },

        error: () => {
          setTimeout(() => {
            this.loading = false;
            this.errorMessage = 'No se pudo conectar con el servidor.';
            console.error('[detalle] network error');
            this.cdr.markForCheck();
          }, 0);
        }
      });
  }

  getTipoOperacionNombre(id: number): string {
    return this.tiposOperacion.find(t => t.id === id)?.nombre || 'OPERACION';
  }

  getTipoPropiedadNombre(id: number): string {
    return this.tiposPropiedad.find(t => t.id === id)?.nombre || 'Propiedad';
  }

  getEstadoPropiedadNombre(id: number): string {
    return this.estadosPropiedad.find(e => e.id === id)?.nombre || 'Estado';
  }
}