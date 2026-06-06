// Tipado estricto para los Agentes Inmobiliarios
export interface Agente {
  nombre: string;
  cargo: string;
  telefono: string;
  email: string;
  avatarUrl: string;
}

// Tipado estricto para las Propiedades
export interface Propiedad {
  id: string;
  titulo: string;
  precio: number;
  direccion: string;
  area: number; // m²
  tipo: 'casa' | 'departamento' | 'terreno';
  operacion: 'venta' | 'alquiler';
  estado: 'Disponible' | 'Reservado' | 'Vendido';
  imagenUrl: string;
  descripcion: string;
  agente: Agente;
}

// Mapeos de base de datos relacionales estáticos (NestJS)
export const MAP_TIPO_PROPIEDAD: Record<number, string> = {
  1: 'casa',
  2: 'departamento',
  3: 'terreno',
  4: 'oficina'
};

export const MAP_TIPO_OPERACION: Record<number, string> = {
  1: 'venta',
  2: 'alquiler'
};

export const MAP_ESTADO_PROPIEDAD: Record<number, string> = {
  1: 'Disponible',
  2: 'Reservado',
  3: 'Vendido'
};

// Agentes simulados
export const MOCK_AGENTES: Record<string, Agente> = {
  alejandro: {
    nombre: "Alejandro Ruiz",
    cargo: "Agente Asociado Senior",
    telefono: "+59177012345",
    email: "aruiz@inmobiliariaerp.com",
    avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop"
  },
  sofia: {
    nombre: "Sofia Valenzuela",
    cargo: "Especialista Residencial Premium",
    telefono: "+59177067890",
    email: "svalenzuela@inmobiliariaerp.com",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop"
  },
  carlos: {
    nombre: "Carlos Mendoza",
    cargo: "Asesor Comercial de Terrenos",
    telefono: "+59177098765",
    email: "cmendoza@inmobiliariaerp.com",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&auto=format&fit=crop"
  }
};

// Catálogo de propiedades de alta calidad (URLs reales de Unsplash)
export const MOCK_PROPIEDADES: Propiedad[] = [
  {
    id: "prop-001",
    titulo: "Residencia Premium Equirol",
    precio: 345000,
    direccion: "Av. Las Palmas, Zona Equipetrol Norte",
    area: 280,
    tipo: "casa",
    operacion: "venta",
    estado: "Disponible",
    imagenUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    descripcion: "Espectacular residencia de diseño contemporáneo ubicada en la zona más exclusiva de Equipetrol. Cuenta con 4 suites de lujo, piscina privada, cocina con acabados italianos de cuarzo y sistema inteligente de iluminación automatizada.",
    agente: MOCK_AGENTES.alejandro
  },
  {
    id: "prop-002",
    titulo: "Penthouse Vista Panorámica Urubó",
    precio: 1800,
    direccion: "Condominio Torres del Urubó, Piso 12",
    area: 165,
    tipo: "departamento",
    operacion: "alquiler",
    estado: "Disponible",
    imagenUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
    descripcion: "Moderno penthouse completamente amoblado con impresionantes vistas panorámicas al río y la ciudad. Incluye master suite con walk-in closet, amplias terrazas, acabados minimalistas premium y acceso directo al club house del condominio.",
    agente: MOCK_AGENTES.sofia
  },
  {
    id: "prop-003",
    titulo: "Terreno Comercial Av. Banzer",
    precio: 495000,
    direccion: "Av. Banzer entre 4to y 5to Anillo",
    area: 820,
    tipo: "terreno",
    operacion: "venta",
    estado: "Reservado",
    imagenUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
    descripcion: "Terreno estratégicamente ubicado sobre la avenida comercial con mayor flujo de la ciudad. Ideal para la construcción de showrooms corporativos, centros médicos o sucursales bancarias. Totalmente plano y con toda la documentación al día.",
    agente: MOCK_AGENTES.carlos
  },
  {
    id: "prop-004",
    titulo: "Departamento Ejecutivo Las Brisas",
    precio: 125000,
    direccion: "Torre Residencial Las Brisas, 8vo Anillo",
    area: 92,
    tipo: "departamento",
    operacion: "venta",
    estado: "Disponible",
    imagenUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
    descripcion: "Departamento ideal para inversionistas o profesionales independientes. Cuenta con 2 dormitorios, balcón con vistas al centro comercial, cocina tipo americana equipada con extractor y encimera, y parqueo cubierto.",
    agente: MOCK_AGENTES.sofia
  },
  {
    id: "prop-005",
    titulo: "Casa Quinta Recreo Porongo",
    precio: 215000,
    direccion: "Porongo Country Club, Sector A",
    area: 1200,
    tipo: "casa",
    operacion: "venta",
    estado: "Vendido",
    imagenUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800&auto=format&fit=crop",
    descripcion: "Hermosa casa quinta campestre rodeada de vegetación nativa y aire puro. Cuenta con 3 dormitorios en planta baja, gran churrasquera con galería techada, piscina y amplias áreas verdes ideales para el descanso familiar de fin de semana.",
    agente: MOCK_AGENTES.alejandro
  },
  {
    id: "prop-006",
    titulo: "Terreno Residencial Urubó Golf",
    precio: 168000,
    direccion: "Urubó Golf Country Club, Manzana 14",
    area: 750,
    tipo: "terreno",
    operacion: "venta",
    estado: "Disponible",
    imagenUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop",
    descripcion: "Terreno residencial exclusivo con frente a la laguna interna del condominio. Cuenta con alcantarillado, servicios soterrados y seguridad de triple anillo. El condominio incluye cancha de golf profesional de 18 hoyos y club house de primer nivel.",
    agente: MOCK_AGENTES.carlos
  }
];
