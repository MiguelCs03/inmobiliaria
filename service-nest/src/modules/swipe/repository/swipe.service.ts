import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Swipe } from '../entities/swipe.entity';
import { Propiedad } from '../../propiedad/entities/propiedad.entity';
import { Cliente } from '../../cliente/entities/cliente.entity';
import { Preferencias } from '../../preferencias/entities/preferencias.entity';
import { CreateSwipeInput } from '../dto/create-swipe.input';

@Injectable()
export class SwipeService {
  constructor(
    @InjectRepository(Swipe)
    private readonly swipeRepository: Repository<Swipe>,
    @InjectRepository(Propiedad)
    private readonly propiedadRepository: Repository<Propiedad>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Preferencias)
    private readonly preferenciasRepository: Repository<Preferencias>,
  ) {}

  async registrarSwipe(usuarioId: number, input: CreateSwipeInput): Promise<Swipe> {
    // Buscar si ya existe un swipe para este usuario y propiedad
    let swipe = await this.swipeRepository.findOne({
      where: {
        usuarioId,
        propiedadId: input.propiedadId,
      },
    });

    if (swipe) {
      swipe.like = input.like;
    } else {
      swipe = this.swipeRepository.create({
        usuarioId,
        propiedadId: input.propiedadId,
        like: input.like,
      });
    }

    return this.swipeRepository.save(swipe);
  }

  async obtenerRecomendaciones(usuarioId: number): Promise<Propiedad[]> {
    // 1. Obtener cliente y sus preferencias declaradas
    const cliente = await this.clienteRepository.findOne({
      where: { usuarioId },
      relations: ['preferencias'],
    });

    // 2. Obtener IDs de las propiedades que este usuario ya deslizó (swiped)
    const swipesRealizados = await this.swipeRepository.find({
      where: { usuarioId },
    });
    const swipedPropIds = swipesRealizados.map((s) => Number(s.propiedadId));

    // 3. Obtener propiedades y filtrar las que tengan estado "Disponible"
    const todasLasPropiedades = await this.propiedadRepository.find({
      relations: ['imagenes', 'tipoPropiedad', 'tipoOperacion', 'estadoPropiedad'],
    });
    const propiedades = todasLasPropiedades.filter(
      (p) => p.estadoPropiedad?.nombre?.toLowerCase() === 'disponible',
    );

    // 4. Filtrar candidatas no deslizadas
    const candidatas = propiedades.filter((p) => !swipedPropIds.includes(Number(p.id)));

    if (candidatas.length === 0) {
      return [];
    }

    // 5. Analizar el perfil de gustos en tiempo real
    const likedIds = swipesRealizados.filter((s) => s.like).map((s) => Number(s.propiedadId));
    const dislikedIds = swipesRealizados.filter((s) => !s.like).map((s) => Number(s.propiedadId));

    const likedProps = propiedades.filter((p) => likedIds.includes(Number(p.id)));
    const dislikedProps = propiedades.filter((p) => dislikedIds.includes(Number(p.id)));

    // Frecuencias de Tipos de Propiedad
    const likedTypes = likedProps.map((p) => p.tipoPropiedadId);
    const dislikedTypes = dislikedProps.map((p) => p.tipoPropiedadId);

    // Frecuencias de Zonas (ej: "equipetrol", "urbarí", "centro")
    const extraerZona = (ubicacion?: string | null): string => {
      if (!ubicacion) return '';
      return ubicacion.split(',')[0].trim().toLowerCase();
    };

    const likedZones = likedProps.map((p) => extraerZona(p.ubicacion));
    const dislikedZones = dislikedProps.map((p) => extraerZona(p.ubicacion));

    // Contador de gustos sobre características secundarias (detallesJson)
    const getFeatureLikes = (feature: string): number => {
      return likedProps.filter((p) => p.detallesJson && p.detallesJson[feature] === true).length;
    };

    // Contador de rechazos sobre características (casas que no tenían algo y se rechazaron)
    const getFeatureDislikes = (feature: string): number => {
      return dislikedProps.filter((p) => !p.detallesJson || p.detallesJson[feature] !== true).length;
    };

    const piscinaLikes = getFeatureLikes('piscina');
    const garageLikes = getFeatureLikes('garage');
    const jardinLikes = getFeatureLikes('jardin');

    const noJardinDislikes = getFeatureDislikes('jardin');
    const noPiscinaDislikes = getFeatureDislikes('piscina');

    // 6. Calcular compatibilidad de cada candidata (Scoring)
    const scoredCandidatas = candidatas.map((p) => {
      let score = 0;

      // A) Ajuste por Preferencias Declaradas en el registro (Estático)
      if (cliente && cliente.preferencias && cliente.preferencias.length > 0) {
        const pref = cliente.preferencias[0];
        
        // Tipo
        if (p.tipoPropiedad.nombre.toLowerCase() === pref.tipoPropiedadBuscada?.toLowerCase()) {
          score += 3;
        }
        // Zona
        if (extraerZona(p.ubicacion) === pref.zonaPreferida?.toLowerCase()) {
          score += 4;
        }
        // Presupuesto
        if (pref.presupuestoMax && Number(p.precioBase) <= Number(pref.presupuestoMax)) {
          score += 2;
        }
        // Cuartos mínimos
        if (pref.habitacionesMinimo && p.detallesJson && p.detallesJson['habitaciones'] >= pref.habitacionesMinimo) {
          score += 2;
        }
      }

      // B) Aprendizaje Dinámico (Basado en likes anteriores del Tinder)
      const pZone = extraerZona(p.ubicacion);

      // Tipo de propiedad que le suele gustar
      const typeLikesCount = likedTypes.filter((t) => t === p.tipoPropiedadId).length;
      score += typeLikesCount * 3;

      // Zonas que le suelen gustar
      const zoneLikesCount = likedZones.filter((z) => z === pZone).length;
      score += zoneLikesCount * 4;

      // Características internas
      if (p.detallesJson) {
        if (p.detallesJson['piscina'] === true) score += piscinaLikes * 3;
        if (p.detallesJson['garage'] === true) score += garageLikes * 2;
        if (p.detallesJson['jardin'] === true) score += jardinLikes * 3;
      }

      // C) Penalizaciones por Rechazos Dinámicos (Dislikes anteriores)
      const typeDislikesCount = dislikedTypes.filter((t) => t === p.tipoPropiedadId).length;
      score -= typeDislikesCount * 3;

      const zoneDislikesCount = dislikedZones.filter((z) => z === pZone).length;
      score -= zoneDislikesCount * 4;

      // Si el cliente rechazó muchas propiedades porque no tenían jardín o piscina, penalizar las que no las tengan
      if (!p.detallesJson || p.detallesJson['jardin'] !== true) {
        score -= noJardinDislikes * 3;
      }
      if (!p.detallesJson || p.detallesJson['piscina'] !== true) {
        score -= noPiscinaDislikes * 2;
      }

      // D) Factor Colaborativo / Segmento de Negocio
      if (cliente && cliente.segmentoId) {
        score += 1; // Ligero bonus base para el segmento asignado
      }

      return { propiedad: p, score };
    });

    // 7. Ordenar de mayor a menor score y retornar
    scoredCandidatas.sort((a, b) => b.score - a.score);
    return scoredCandidatas.map((sc) => sc.propiedad);
  }
}
