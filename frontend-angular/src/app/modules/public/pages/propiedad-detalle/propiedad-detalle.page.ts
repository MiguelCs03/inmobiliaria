import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);

  propiedad?: Propiedad;
  loading = true;
  errorMessage = '';

  imagenes: string[] = [];
  mainImageUrl = '';

  titulo = '';
  tipoOperacionNombre = '';
  tipoPropiedadNombre = '';
  estadoPropiedadNombre = '';
  
  // Ubicación georeferenciada parsed
  ubicacionTexto = '';
  descripcion = '';
  latitud = -17.783327; // Bolivia Santa Cruz default
  longitud = -63.182140;

  readonly defaultLat = -17.783327;
  readonly defaultLng = -63.182140;

  // Leaflet map instance
  private map: any;

  // Agente asignado
  agenteAsignado: any = null;
  whatsappLink = '';

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
    { id: 2, nombre: 'ALQUILER' },
    { id: 3, nombre: 'ANTICRÉTICO' }
  ];

  estadosPropiedad = [
    { id: 1, nombre: 'Disponible' },
    { id: 2, nombre: 'Reservado' },
    { id: 3, nombre: 'Vendido' }
  ];

  // Base de datos local premium de Agentes para visualización cliente
  mockAgents = [
    { id: 101, nombres: 'Carlos Alberto', apellidos: 'Mendoza Soliz', fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60', telefono: '59177012345' },
    { id: 102, nombres: 'Sofía Vanessa', apellidos: 'Arandia Justiniano', fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60', telefono: '59176098765' },
    { id: 103, nombres: 'Mariano Hugo', apellidos: 'Pinto Becerra', fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60', telefono: '59169024680' },
    { id: 104, nombres: 'Valeria Nicole', apellidos: 'Rojas Cabrera', fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60', telefono: '59178054321' }
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

            // --- DECODIFICACIÓN DE LA UBICACIÓN GEOLOCALIZADA ---
            this.parseGeolocation(this.propiedad.ubicacion, this.propiedad.id);

            // --- ASIGNACIÓN Y ASOCIACIÓN DEL AGENTE ---
            this.resolveAssignedAgent(this.propiedad.id);

            this.titulo =
              `${this.tipoPropiedadNombre}${this.ubicacionTexto ? ' en ' + this.ubicacionTexto : ''}`;

            this.loading = false;
            this.cdr.markForCheck();

            // Inicializar el mapa de Leaflet en la vista pública
            this.initPublicMap();

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

  private parseGeolocation(ubicacionJsonStr: string | null, propiedadId: number): void {
    if (!ubicacionJsonStr) {
      this.ubicacionTexto = 'Sin ubicación de referencia';
      this.latitud = this.defaultLat;
      this.longitud = this.defaultLng;
      this.descripcion = 'Inmueble con excelente ubicación en zona comercial residencial activa. Cuenta con todos los servicios básicos y accesos a avenidas principales.';
      return;
    }

    if (!ubicacionJsonStr.startsWith('{')) {
      // Legacy simple string location
      this.ubicacionTexto = ubicacionJsonStr;
      this.latitud = this.defaultLat;
      this.longitud = this.defaultLng;
      this.descripcion = 'Inmueble con excelente ubicación en zona comercial residencial activa. Cuenta con todos los servicios básicos y accesos a avenidas principales.';
      return;
    }

    try {
      const parsed = JSON.parse(ubicacionJsonStr);
      this.ubicacionTexto = parsed.direccion || 'Sin dirección de referencia';
      this.latitud = parsed.lat || this.defaultLat;
      this.longitud = parsed.lng || this.defaultLng;
      this.descripcion = parsed.descripcion || 'Inmueble con excelente ubicación en zona comercial residencial activa. Cuenta con todos los servicios básicos y accesos a avenidas principales.';
    } catch (e) {
      console.warn('Error al decodificar ubicación estructurada:', e);
      this.ubicacionTexto = ubicacionJsonStr;
      this.latitud = this.defaultLat;
      this.longitud = this.defaultLng;
      this.descripcion = 'Inmueble con excelente ubicación en zona comercial residencial activa. Cuenta con todos los servicios básicos y accesos a avenidas principales.';
    }
  }

  private resolveAssignedAgent(propiedadId: number): void {
    // Si la ubicación contiene un agenteId guardado, lo recuperamos, sino calculamos uno determinista basado en el ID
    let targetAgentId = 101;
    
    if (this.propiedad?.ubicacion && this.propiedad.ubicacion.startsWith('{')) {
      try {
        const parsed = JSON.parse(this.propiedad.ubicacion);
        if (parsed.agenteId) {
          targetAgentId = parsed.agenteId;
        } else {
          targetAgentId = 101 + (propiedadId % this.mockAgents.length);
        }
      } catch {
        targetAgentId = 101 + (propiedadId % this.mockAgents.length);
      }
    } else {
      targetAgentId = 101 + (propiedadId % this.mockAgents.length);
    }

    // Buscar agente en nuestra base de datos local
    const agent = this.mockAgents.find(a => a.id === targetAgentId);
    this.agenteAsignado = agent || this.mockAgents[0];

    // --- ENLACE A WHATSAPP DEEP-LINK CON MENSAJE PRELLENADO ---
    const message = `Hola, estoy interesado en el inmueble con ID: ${propiedadId} ubicado en ${this.ubicacionTexto}`;
    const encodedMessage = encodeURIComponent(message);
    this.whatsappLink = `https://wa.me/${this.agenteAsignado.telefono}?text=${encodedMessage}`;
  }

  // --- MAPA DE LEAFLET EN EL DETALLE ---
  private async initPublicMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(async () => {
      try {
        const L = await import('leaflet');
        const mapContainer = document.getElementById('publicMap');
        if (!mapContainer) return;

        if (this.map) {
          this.map.remove();
        }

        // Estilo adaptativo de mapa (Positron elegante para clientes en modo normal)
        // Puedes cambiar a dark tiles si el cliente maneja modo oscuro global
        const isDark = typeof document !== 'undefined' && document.body.classList.contains('dark');
        const tileUrl = isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        this.map = L.map('publicMap', {
          center: [this.latitud, this.longitud],
          zoom: 15,
          zoomControl: true,
          scrollWheelZoom: false // Evitar zooms molestos al hacer scroll en el navegador
        });

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20
        }).addTo(this.map);

        // Icono de Pin Inmobiliario personalizado premium (Verde Éxito Financiero)
        const customIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Crear Pin en la ubicación del inmueble
        L.marker([this.latitud, this.longitud], {
          icon: customIcon
        })
        .addTo(this.map)
        .bindPopup(`<strong class="text-blue-900">${this.tipoPropiedadNombre}</strong><br>${this.ubicacionTexto}`)
        .openPopup();

        // Corregir tamaño del mapa Leaflet
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 300);

      } catch (err) {
        console.error('Error al inicializar Leaflet en la vista pública de detalles:', err);
      }
    }, 100);
  }

  setMainImage(url: string): void {
    this.mainImageUrl = url;
    this.cdr.markForCheck();
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