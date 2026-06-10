import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { UploadService } from '../../../core/services/upload.service';
import { AiAnalysisService, AiAnalysisResponse } from '../../../core/services/ai-analysis.service';

export interface Propiedad {
  id: number;
  propietarioId: number;
  tipoPropiedadId: number;
  tipoOperacionId: number;
  estadoPropiedadId: number;
  precioBase: number;
  areaM2: number;
  ubicacion: string | null;
  imagenes?: { id: number; urlS3: string }[];
}

export interface Propietario {
  id: number;
  nombres: string;
}

interface PropiedadesQueryResponse {
  propiedades: {
    success: boolean;
    message: string;
    data: Propiedad[] | null;
  };
}

interface PropietariosQueryResponse {
  propietarios: {
    success: boolean;
    message: string;
    data: Propietario[] | null;
  };
}

interface CreatePropiedadMutationResponse {
  createPropiedad: {
    success: boolean;
    message: string;
    data: Propiedad | null;
  };
}

@Component({
  selector: 'app-propiedades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './propiedades.component.html',
  styleUrls: ['./propiedades.component.css']
})
export class PropiedadesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apollo = inject(Apollo);
  private cdr = inject(ChangeDetectorRef);
  private uploadService = inject(UploadService);
  private aiAnalysisService = inject(AiAnalysisService);
  private platformId = inject(PLATFORM_ID);

  propiedadForm!: FormGroup;
  propiedades: Propiedad[] = [];
  propietarios: Propietario[] = [];
  filteredPropiedades: Propiedad[] = [];

  // Listado de empleados / agentes
  empleados: any[] = [];
  filteredEmpleados: any[] = [];
  selectedEmpleado: any = null;
  showEmpleadoDropdown = false;
  searchEmpleadoTerm = '';

  loadingList = false;
  loadingPropietarios = false;
  submitting = false;
  showModal = false; // Control de visualización del modal emergente

  uploadedImagenesUrls: string[] = [];
  uploadingImagen = false;

  // Drag & Drop y análisis con IA (Django CNN)
  isDragging = false;
  aiResults: { [url: string]: AiAnalysisResponse } = {}; // Resultados reales del modelo CNN
  detectingIa: { [url: string]: boolean } = {}; // Carga de estado para análisis de IA
  overallAnalysis: {
    conservationCounts: { [key: string]: number };
    ambientCounts: { [key: string]: number };
    overallState: string;
    recommendation: string;
  } | null = null;

  // Leaflet Map properties
  private map: any;
  private marker: any;
  private readonly defaultLat = -17.783327; // Coordenada por defecto (Santa Cruz de la Sierra, Bolivia)
  private readonly defaultLng = -63.182140;

  successMessage = '';
  errorMessage = '';
  filterType = '0'; // 0 = Todos, 1 = Venta, 2 = Alquiler, 3 = Anticrético

  private successTimeout: any = null;
  private errorTimeout: any = null;

  // Catálogos locales para mapear IDs a nombres descriptivos
  tiposPropiedad = [
    { id: 1, nombre: 'Casa' },
    { id: 2, nombre: 'Departamento' },
    { id: 3, nombre: 'Terreno' },
    { id: 4, nombre: 'Oficina' }
  ];

  tiposOperacion = [
    { id: 1, nombre: 'Venta' },
    { id: 2, nombre: 'Alquiler' },
    { id: 3, nombre: 'Anticrético' }
  ];

  estadosPropiedad = [
    { id: 1, nombre: 'Disponible' },
    { id: 2, nombre: 'Reservado' },
    { id: 3, nombre: 'Vendido / Rentado' }
  ];

  // Queries y Mutaciones GraphQL
  private readonly GET_PROPIEDADES = gql`
    query GetPropiedades {
      propiedades {
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

  private readonly GET_PROPIETARIOS = gql`
    query GetPropietarios {
      propietarios {
        success
        message
        data {
          id
          nombres
        }
      }
    }
  `;

  private readonly GET_EMPLEADOS = gql`
    query GetEmpleados {
      empleados {
        success
        message
        data {
          id
          nombres
          apellidos
        }
      }
    }
  `;

  private readonly CREATE_PROPIEDAD = gql`
    mutation CreatePropiedad($input: CreatePropiedadInput!) {
      createPropiedad(createPropiedadInput: $input) {
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
    this.initForm();
    this.loadPropietarios();
    this.loadEmpleados();
    this.loadPropiedades();
  }

  private initForm(): void {
    this.propiedadForm = this.fb.group({
      propietarioId: ['', [Validators.required]],
      tipoPropiedadId: ['', [Validators.required]],
      tipoOperacionId: ['', [Validators.required]],
      estadoPropiedadId: ['', [Validators.required]],
      precioBase: ['', [Validators.required, Validators.min(100)]],
      areaM2: ['', [Validators.required, Validators.min(5)]],
      direccionReferencia: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      latitud: [{ value: '', disabled: true }, [Validators.required]],
      longitud: [{ value: '', disabled: true }, [Validators.required]],
      agenteId: ['', [Validators.required]] // ID del empleado responsable
    });
  }

  showSuccess(message: string): void {
    if (this.successTimeout) clearTimeout(this.successTimeout);
    this.successMessage = message;
    this.errorMessage = '';
    this.cdr.detectChanges();
    this.successTimeout = setTimeout(() => {
      this.successMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  showError(message: string): void {
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorMessage = message;
    this.successMessage = '';
    this.cdr.detectChanges();
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  openModal(): void {
    this.showModal = true;
    this.uploadedImagenesUrls = [];
    this.aiResults = {};
    this.detectingIa = {};
    this.overallAnalysis = null;
    this.uploadingImagen = false;
    this.selectedEmpleado = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.loadPropietarios();
    this.loadEmpleados();
    
    // Inicializar el mapa Leaflet en el modal después de que el DOM se haya renderizado
    this.initFormMap();
  }

  closeModal(): void {
    this.showModal = false;
    this.uploadedImagenesUrls = [];
    this.aiResults = {};
    this.detectingIa = {};
    this.overallAnalysis = null;
    this.uploadingImagen = false;
    this.selectedEmpleado = null;
    this.showEmpleadoDropdown = false;
    this.propiedadForm.reset({
      propietarioId: '',
      tipoPropiedadId: '',
      tipoOperacionId: '',
      estadoPropiedadId: '',
      agenteId: ''
    });

    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }
  }

  // --- LÓGICA DE AGENTES / EMPLEADOS ---
  loadEmpleados(): void {
    this.apollo.watchQuery<any>({
      query: this.GET_EMPLEADOS,
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        if (result.data?.empleados?.success && result.data.empleados.data) {
          this.empleados = result.data.empleados.data;
          this.filteredEmpleados = [...this.empleados];
        } else {
          this.loadMockEmpleados();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al consultar empleados del backend. Cargando mocks...', err);
        this.loadMockEmpleados();
        this.cdr.detectChanges();
      }
    });
  }

  private loadMockEmpleados(): void {
    // Lista de agentes premium mockeados para wow factor y fallback
    this.empleados = [
      { id: 101, nombres: 'Carlos Alberto', apellidos: 'Mendoza Soliz', fotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60', telefono: '+591 77012345' },
      { id: 102, nombres: 'Sofía Vanessa', apellidos: 'Arandia Justiniano', fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60', telefono: '+591 76098765' },
      { id: 103, nombres: 'Mariano Hugo', apellidos: 'Pinto Becerra', fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60', telefono: '+591 69024680' },
      { id: 104, nombres: 'Valeria Nicole', apellidos: 'Rojas Cabrera', fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60', telefono: '+591 78054321' }
    ];
    this.filteredEmpleados = [...this.empleados];
  }

  toggleEmpleadoDropdown(event: Event): void {
    event.stopPropagation();
    this.showEmpleadoDropdown = !this.showEmpleadoDropdown;
  }

  onSearchEmpleado(event: any): void {
    this.searchEmpleadoTerm = event.target.value;
    const term = this.searchEmpleadoTerm.toLowerCase();
    this.filteredEmpleados = this.empleados.filter(e => 
      `${e.nombres} ${e.apellidos}`.toLowerCase().includes(term)
    );
  }

  selectEmpleado(empleado: any): void {
    this.selectedEmpleado = empleado;
    this.propiedadForm.get('agenteId')?.setValue(empleado.id);
    this.showEmpleadoDropdown = false;
    this.searchEmpleadoTerm = '';
    this.filteredEmpleados = [...this.empleados];
    this.cdr.detectChanges();
  }

  // --- LÓGICA DE GEOLOCALIZACIÓN INTERACTIVA (LEAFLET) ---
  private async initFormMap(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    // Pequeño retardo para asegurar que el contenedor #intranetMap existe en el DOM tras abrir el modal
    setTimeout(async () => {
      try {
        const leafletModule = await import('leaflet');
        const L = (leafletModule as any).default || leafletModule;
        const mapContainer = document.getElementById('intranetMap');
        if (!mapContainer) return;

        if (this.map) {
          this.map.remove();
        }

        // Estilo adaptativo de mapa (CartoDB Dark Matter si es oscuro, Voyager si es claro)
        const isDark = document.body.classList.contains('dark');
        const tileUrl = isDark
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

        this.map = L.map('intranetMap', {
          center: [this.defaultLat, this.defaultLng],
          zoom: 14,
          zoomControl: true
        });

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20
        }).addTo(this.map);

        // Icono de Pin Inmobiliario personalizado premium (Azul Profundo Inmobiliario)
        const customIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Crear marcador draggable en el centro por defecto
        this.marker = L.marker([this.defaultLat, this.defaultLng], {
          icon: customIcon,
          draggable: true
        }).addTo(this.map);

        // Rellenar valores iniciales en los inputs de solo lectura
        this.updateCoordinates(this.defaultLat, this.defaultLng);

        // Escuchar el evento dragend del marcador para capturar coordenadas al arrastrar el Pin
        this.marker.on('dragend', () => {
          const position = this.marker.getLatLng();
          this.updateCoordinates(position.lat, position.lng);
        });

        // Escuchar clics en el mapa para mover el marcador visualmente y actualizar coordenadas
        this.map.on('click', (e: any) => {
          const coords = e.latlng;
          this.marker.setLatLng(coords);
          this.updateCoordinates(coords.lat, coords.lng);
        });

        // Corregir tamaño del contenedor del mapa
        setTimeout(() => {
          if (this.map) {
            this.map.invalidateSize();
          }
        }, 400);

      } catch (err) {
        console.error('Error al inicializar Leaflet en el formulario de la Intranet:', err);
      }
    }, 200);
  }

  private updateCoordinates(lat: number, lng: number): void {
    this.propiedadForm.get('latitud')?.setValue(lat.toFixed(6));
    this.propiedadForm.get('longitud')?.setValue(lng.toFixed(6));
    this.cdr.detectChanges();
  }

  // --- DRAG AND DROP E INTELIGENCIA ARTIFICIAL (IA) SIMULADA ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processAndUploadFile(files[0]);
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    this.processAndUploadFile(files[0]);
  }

  private processAndUploadFile(file: File): void {
    this.uploadingImagen = true;
    this.cdr.detectChanges();

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        if (res.success && res.url) {
          const url = res.url;
          this.uploadedImagenesUrls.push(url);
          this.showSuccess('Imagen subida con éxito. Analizando con IA...');

          // Analizar con el modelo CNN de Django (via URL desde Cloudinary)
          this.detectingIa[url] = true;
          this.cdr.detectChanges();

          this.aiAnalysisService.analyzeImageUrl(url).subscribe({
            next: (aiResult) => {
              this.detectingIa[url] = false;
              this.aiResults[url] = aiResult;
              this.updateOverallRecommendation();
              this.cdr.detectChanges();
            },
            error: (err) => {
              this.detectingIa[url] = false;
              console.error('Error al analizar imagen con CNN:', err);
              this.aiResults[url] = {
                ambiente: null,
                conservacion: null,
                modo: 'error'
              };
              this.cdr.detectChanges();
            }
          });
        } else {
          this.showError(res.message || 'Error al subir la imagen.');
        }
        this.uploadingImagen = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploadingImagen = false;
        console.error('Error al subir imagen:', err);
        this.showError('Error de red al intentar subir la imagen.');
        this.cdr.detectChanges();
      }
    });
  }

  removeUploadedImage(index: number): void {
    const url = this.uploadedImagenesUrls[index];
    this.uploadedImagenesUrls.splice(index, 1);
    delete this.aiResults[url];
    delete this.detectingIa[url];
    this.updateOverallRecommendation();
    this.cdr.detectChanges();
  }

  private updateOverallRecommendation(): void {
    const conservations = Object.values(this.aiResults)
      .map(r => r?.conservacion?.clase)
      .filter(Boolean) as string[];

    const ambients = Object.values(this.aiResults)
      .map(r => r?.ambiente?.clase)
      .filter(Boolean) as string[];

    if (conservations.length === 0) {
      this.overallAnalysis = null;
      return;
    }

    const conservationCounts: { [key: string]: number } = {};
    for (const c of conservations) {
      conservationCounts[c] = (conservationCounts[c] || 0) + 1;
    }

    const ambientCounts: { [key: string]: number } = {};
    for (const a of ambients) {
      ambientCounts[a] = (ambientCounts[a] || 0) + 1;
    }

    let maxCount = 0;
    let overallState = 'Regular';
    for (const [state, count] of Object.entries(conservationCounts)) {
      if (count > maxCount) {
        maxCount = count;
        overallState = state;
      }
    }

    let recommendation = '';
    switch (overallState) {
      case 'Excelente':
        recommendation = 'La propiedad se encuentra en condiciones óptimas. Lista para comercialización inmediata a precio premium.';
        break;
      case 'Bueno':
        recommendation = 'La propiedad está en buenas condiciones generales. Se recomienda realizar pequeñas mejoras estéticas antes de la venta para maximizar el valor.';
        break;
      case 'Regular':
        recommendation = 'La propiedad requiere mantenimiento y reparaciones. Se recomienda invertir en renovaciones básicas para mejorar su valor de mercado.';
        break;
      default:
        recommendation = 'No se pudo determinar el estado general de la propiedad. Se recomienda una inspección presencial.';
    }

    this.overallAnalysis = {
      conservationCounts,
      ambientCounts,
      overallState,
      recommendation
    };
  }

  // --- MÉTODOS DE LA LISTA Y DE CARGA ---
  loadPropietarios(): void {
    this.loadingPropietarios = true;
    this.cdr.detectChanges();
    this.apollo.watchQuery<PropietariosQueryResponse>({
      query: this.GET_PROPIETARIOS,
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        this.loadingPropietarios = false;
        if (result.data?.propietarios?.success && result.data.propietarios.data) {
          this.propietarios = result.data.propietarios.data as Propietario[];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingPropietarios = false;
        console.error('Error loading owners:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadPropiedades(): void {
    this.loadingList = true;
    this.cdr.detectChanges();

    this.apollo.watchQuery<PropiedadesQueryResponse>({
      query: this.GET_PROPIEDADES,
      fetchPolicy: 'network-only'
    }).valueChanges.subscribe({
      next: (result) => {
        this.loadingList = false;
        if (result.data?.propiedades?.success !== false) {
          this.propiedades = (result.data?.propiedades?.data || []) as Propiedad[];
          this.applyFilter();
        } else {
          this.showError(result.data?.propiedades?.message || 'Error al obtener propiedades.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loadingList = false;
        console.error('Error loading properties:', err);
        this.showError('No se pudo conectar con el servidor. Verifique si el API Gateway y el microservicio están activos.');
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit(): void {
    if (this.propiedadForm.invalid) {
      this.propiedadForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const formValues = this.propiedadForm.getRawValue(); // Usa getRawValue para capturar latitud/longitud deshabilitados
    
    // Serialización estructurada de geolocalización y agente en el campo string 'ubicacion' compatible
    const ubicacionEstructurada = JSON.stringify({
      direccion: formValues.direccionReferencia,
      descripcion: formValues.descripcion,
      lat: parseFloat(formValues.latitud),
      lng: parseFloat(formValues.longitud),
      agenteId: parseInt(formValues.agenteId, 10)
    });

    const input = {
      propietarioId: parseInt(formValues.propietarioId, 10),
      tipoPropiedadId: parseInt(formValues.tipoPropiedadId, 10),
      tipoOperacionId: parseInt(formValues.tipoOperacionId, 10),
      estadoPropiedadId: parseInt(formValues.estadoPropiedadId, 10),
      precioBase: parseFloat(formValues.precioBase),
      areaM2: parseFloat(formValues.areaM2),
      ubicacion: ubicacionEstructurada,
      imagenesUrls: this.uploadedImagenesUrls
    };

    this.apollo.mutate<CreatePropiedadMutationResponse>({
      mutation: this.CREATE_PROPIEDAD,
      variables: { input }
    }).subscribe({
      next: (result) => {
        this.submitting = false;
        const res = result.data?.createPropiedad;
        if (res?.success && res.data) {
          this.showSuccess('¡Inmueble registrado y geolocalizado de forma exitosa!');
          this.closeModal();
          this.loadPropiedades();
        } else {
          this.showError(res?.message || 'Error al registrar propiedad.');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        console.error('Error creating property:', err);
        this.showError('Error de red al intentar registrar. Intente más tarde.');
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(event: any): void {
    this.filterType = event.target.value;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.filterType === '0') {
      this.filteredPropiedades = [...this.propiedades];
      return;
    }
    const filterId = parseInt(this.filterType, 10);
    this.filteredPropiedades = this.propiedades.filter(p => p.tipoOperacionId === filterId);
  }

  // --- HELPERS DE TEXTO PARA LA VISTA ---
  getTipoPropiedadNombre(id: number): string {
    return this.tiposPropiedad.find(t => t.id === id)?.nombre || 'Propiedad';
  }

  getTipoOperacionNombre(id: number): string {
    return this.tiposOperacion.find(t => t.id === id)?.nombre || 'Venta';
  }

  getEstadoPropiedadNombre(id: number): string {
    return this.estadosPropiedad.find(e => e.id === id)?.nombre || 'Disponible';
  }

  getPropietarioNombre(id: number): string {
    return this.propietarios.find(p => p.id === id)?.nombres || `Propietario #${id}`;
  }

  getDireccionReferencia(ubicacionJsonStr: string | null): string {
    if (!ubicacionJsonStr) return 'Sin dirección registrada';
    if (!ubicacionJsonStr.startsWith('{')) return ubicacionJsonStr; // legacy string
    try {
      const parsed = JSON.parse(ubicacionJsonStr);
      return parsed.direccion || 'Sin dirección';
    } catch {
      return ubicacionJsonStr;
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propiedadForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
