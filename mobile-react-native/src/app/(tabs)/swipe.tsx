import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Heart,
  X,
  Info,
  MapPin,
  Maximize2,
  RefreshCw,
  Sparkles,
  Building2,
  Home,
  Layers
} from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import {
  MAP_TIPO_PROPIEDAD,
  MAP_TIPO_OPERACION,
  MAP_ESTADO_PROPIEDAD
} from '@/constants/properties';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * width; // 25% de la pantalla para confirmar swipe
const CARD_HEIGHT = height * 0.62; // Altura responsiva de la tarjeta

// Query de GraphQL para obtener las recomendaciones híbridas en tiempo real
const QUERY_RECOMENDACIONES = gql`
  query GetSwipeRecomendaciones($usuarioId: Int!) {
    swipeRecomendaciones(usuarioId: $usuarioId) {
      success
      message
      data {
        id
        areaM2
        estadoPropiedadId
        precioBase
        propietarioId
        tipoOperacionId
        tipoPropiedadId
        ubicacion
        imagenes {
          id
          urlS3
        }
      }
    }
  }
`;

// Mutation de GraphQL para registrar el swipe (Like / Dislike) en tiempo real
const MUTATION_REGISTRAR_SWIPE = gql`
  mutation RegistrarSwipe($usuarioId: Int!, $input: CreateSwipeInput!) {
    registrarSwipe(usuarioId: $usuarioId, input: $input) {
      success
      message
    }
  }
`;

export default function SwipeScreen() {
  const { usuario } = useAuth();
  const usuarioId = usuario?.id || 0;

  // Query para cargar recomendaciones
  const { data, loading, error, refetch } = useQuery<any>(QUERY_RECOMENDACIONES, {
    variables: { usuarioId },
    skip: !usuarioId,
    fetchPolicy: 'network-only' // Siempre de la red para alimentar la IA dinámicamente
  });

  // Mutation para registrar swipe
  const [registrarSwipeMutation] = useMutation<any>(MUTATION_REGISTRAR_SWIPE);

  // Lista de propiedades recomendadas
  const propiedades = useMemo(() => {
    return data?.swipeRecomendaciones?.data || [];
  }, [data]);

  // Estado del índice de la tarjeta actual
  const [currentIndex, setCurrentIndex] = useState(0);

  // Valor animado para la posición del arrastre
  const position = useRef(new Animated.ValueXY()).current;

  // Reiniciar el índice si las recomendaciones se recargan
  useEffect(() => {
    setCurrentIndex(0);
  }, [propiedades]);

  // Manejador del gesto de arrastre (PanResponder)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: (event, gesture) => {
          if (gesture.dx > SWIPE_THRESHOLD) {
            // Swipe a la Derecha (Like)
            swipeCard('right', gesture.dy);
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            // Swipe a la Izquierda (Nope)
            swipeCard('left', gesture.dy);
          } else {
            // Volver al centro
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 4,
              useNativeDriver: false
            }).start();
          }
        }
      }),
    [position, currentIndex, propiedades, usuarioId]
  );

  // Ejecuta la animación de salida y registra la acción en base de datos
  const swipeCard = (direction: 'right' | 'left', initialY: number = 0) => {
    const targetX = direction === 'right' ? width + 120 : -width - 120;
    
    Animated.timing(position, {
      toValue: { x: targetX, y: initialY },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      registrarSwipe(direction === 'right');
    });
  };

  // Llama a la mutation e incrementa el índice
  const registrarSwipe = async (like: boolean) => {
    const propiedadActual = propiedades[currentIndex];
    if (!propiedadActual) return;

    try {
      // Registrar en el backend para actualizar la IA de recomendación híbrida
      await registrarSwipeMutation({
        variables: {
          usuarioId,
          input: {
            propiedadId: Number(propiedadActual.id),
            like
          }
        }
      });
    } catch (err) {
      console.error('Error al registrar swipe:', err);
    }

    // Resetear posición y avanzar al siguiente inmueble
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  // Formateador de precio
  const formatearPrecio = (precio: number, tipoOperacionId: number) => {
    const precioFormateado = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(precio);

    return tipoOperacionId === 2 ? `${precioFormateado} / mes` : precioFormateado;
  };

  // Estilos interpolados para la tarjeta de arriba
  const rotacionTarjeta = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const estiloTarjetaTop = {
    ...position.getLayout(),
    transform: [{ rotate: rotacionTarjeta }]
  };

  // Opacidad del texto/badge de feedback flotante
  const opacidadLike = position.x.interpolate({
    inputRange: [0, width / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const opacidadNope = position.x.interpolate({
    inputRange: [-width / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  // Estilos interpolados para la tarjeta que está por debajo en el deck (vista previa)
  const escalaTarjetaDetras = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.95, 1],
    extrapolate: 'clamp'
  });

  const opacidadTarjetaDetras = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: [1, 0.85, 1],
    extrapolate: 'clamp'
  });

  // Renderizar estado de carga
  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-500 text-sm mt-3 font-semibold">
          Buscando inmuebles perfectos para ti...
        </Text>
      </View>
    );
  }

  // Renderizar estado de error
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
        <View className="items-center">
          <Layers size={60} color="#f43f5e" />
          <Text className="text-slate-900 text-lg font-bold mt-4 mb-2">
            Error al Cargar Recomendaciones
          </Text>
          <Text className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
            No se pudo establecer comunicación con el motor de recomendaciones. Por favor, reintenta de nuevo.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-corporate-600 px-6 py-3 rounded-xl shadow-sm active:bg-corporate-700 flex-row items-center"
          >
            <RefreshCw size={16} color="#ffffff" className="mr-2" />
            <Text className="text-white font-bold text-sm">Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizar estado cuando no hay más propiedades por evaluar
  if (currentIndex >= propiedades.length) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
        <StatusBar barStyle="dark-content" />
        <View className="items-center max-w-sm">
          <View className="w-20 h-20 bg-blue-50 rounded-full justify-center items-center mb-6 shadow-sm">
            <Sparkles size={40} color="#2563eb" />
          </View>
          <Text className="text-slate-900 text-xl font-extrabold text-center mb-3">
            ¡Eso es todo por ahora!
          </Text>
          <Text className="text-slate-500 text-sm text-center mb-8 leading-relaxed">
            Nuestra IA ha aprendido de tus preferencias. Agregaremos más propiedades pronto. Haz clic abajo para recargar la lista de inmuebles disponibles.
          </Text>
          <TouchableOpacity
            onPress={() => {
              refetch();
            }}
            className="bg-corporate-600 px-6 py-3.5 rounded-2xl shadow-md active:bg-corporate-700 flex-row items-center"
          >
            <RefreshCw size={16} color="#ffffff" className="mr-2" />
            <Text className="text-white font-bold text-sm">Recargar Recomendaciones</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* Cabecera / Branding */}
      <View className="px-5 pt-3 pb-2 flex-row justify-between items-center border-b border-slate-100 bg-white">
        <View>
          <View className="flex-row items-center">
            <Sparkles size={18} color="#2563eb" className="mr-1.5" />
            <Text className="text-slate-900 text-xl font-black">
              Matchmaking
            </Text>
          </View>
          <Text className="text-slate-400 text-xs font-medium">
            Recomendaciones inteligentes en tiempo real
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => refetch()}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 justify-center items-center active:bg-slate-100"
        >
          <RefreshCw size={16} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Área del Deck de Tarjetas */}
      <View className="flex-1 justify-center items-center px-4">
        {propiedades
          .map((item: any, index: number) => {
            // No renderizar tarjetas ya procesadas
            if (index < currentIndex) return null;

            // Renderizar un deck limitado para rendimiento (2 tarjetas visibles a la vez)
            if (index > currentIndex + 1) return null;

            // Mapeo relacional de datos
            const tipoNombre = MAP_TIPO_PROPIEDAD[item.tipoPropiedadId] || 'casa';
            const operacionNombre = MAP_TIPO_OPERACION[item.tipoOperacionId] || 'venta';
            
            const imagenUrl = item.imagenes && item.imagenes.length > 0
              ? item.imagenes[0].urlS3
              : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';

            const tituloCompuesto = `${tipoNombre.charAt(0).toUpperCase() + tipoNombre.slice(1)} en ${item.ubicacion?.split(',')[0] || 'Zona Residencial'}`;

            // Determinar ícono de tipo
            const renderIconoTipo = () => {
              switch (tipoNombre) {
                case 'casa': return <Home size={15} color="#ffffff" />;
                case 'departamento': return <Building2 size={15} color="#ffffff" />;
                default: return <Layers size={15} color="#ffffff" />;
              }
            };

            const esTarjetaTop = index === currentIndex;

            return (
              <Animated.View
                key={item.id}
                style={[
                  styles.cardContainer,
                  esTarjetaTop ? estiloTarjetaTop : {
                    transform: [{ scale: escalaTarjetaDetras }],
                    opacity: opacidadTarjetaDetras
                  },
                  { zIndex: esTarjetaTop ? 99 : 98 }
                ]}
                {...(esTarjetaTop ? panResponder.panHandlers : {})}
              >
                <View className="flex-1 bg-white rounded-3xl overflow-hidden border border-slate-200/60 shadow-lg">
                  {/* Imagen de Fondo de la Propiedad */}
                  <Image
                    source={{ uri: imagenUrl }}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    contentFit="cover"
                  />

                  {/* Gradiente degradado de fondo para legibilidad de textos */}
                  <View style={styles.gradientOverlay} />

                  {/* Badges de Feedback Visual Flotantes (Solo en la tarjeta superior) */}
                  {esTarjetaTop && (
                    <>
                      {/* Badge LIKE */}
                      <Animated.View
                        style={[styles.badgeLike, { opacity: opacidadLike }]}
                      >
                        <Text style={styles.badgeLikeText}>LIKE</Text>
                      </Animated.View>

                      {/* Badge NOPE */}
                      <Animated.View
                        style={[styles.badgeNope, { opacity: opacidadNope }]}
                      >
                        <Text style={styles.badgeNopeText}>NOPE</Text>
                      </Animated.View>
                    </>
                  )}

                  {/* Contenedor del contenido informativo al fondo de la tarjeta */}
                  <View className="absolute bottom-0 left-0 right-0 p-6">
                    {/* Badge de tipo de operación (Venta / Alquiler) */}
                    <View className="flex-row items-center gap-2 mb-3">
                      <View className="bg-corporate-600 px-3 py-1 rounded-lg">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                          {operacionNombre}
                        </Text>
                      </View>
                      <View className="bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-lg flex-row items-center">
                        {renderIconoTipo()}
                        <Text className="text-white text-[10px] font-semibold uppercase tracking-wider ml-1 capitalize">
                          {tipoNombre}
                        </Text>
                      </View>
                    </View>

                    {/* Precio Base */}
                    <Text className="text-white text-3xl font-black mb-1">
                      {formatearPrecio(item.precioBase, item.tipoOperacionId)}
                    </Text>

                    {/* Título de la propiedad */}
                    <Text className="text-white text-xl font-bold mb-2 leading-tight">
                      {tituloCompuesto}
                    </Text>

                    {/* Ubicación y Dirección */}
                    <View className="flex-row items-center mb-3">
                      <MapPin size={14} color="#e2e8f0" />
                      <Text className="text-slate-200 text-xs ml-1 flex-1 font-medium" numberOfLines={1}>
                        {item.ubicacion || 'Ubicación no registrada'}
                      </Text>
                    </View>

                    {/* Detalles Adicionales rápidos (Área) */}
                    <View className="flex-row items-center pt-3 border-t border-white/10">
                      <View className="flex-row items-center bg-white/10 px-2.5 py-1 rounded-lg">
                        <Maximize2 size={13} color="#ffffff" />
                        <Text className="text-white text-[11px] font-bold ml-1">
                          {item.areaM2} m² de área
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })
          .reverse()}
      </View>

      {/* Fila de Botones de Control Inferiores */}
      <View className="flex-row justify-center items-center gap-6 pb-8 pt-2">
        {/* Botón Dislike (Nope) */}
        <TouchableOpacity
          onPress={() => swipeCard('left')}
          activeOpacity={0.8}
          className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-md justify-center items-center active:bg-rose-50"
        >
          <X size={28} color="#f43f5e" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Botón Ver Info (Detalle) */}
        <TouchableOpacity
          onPress={() => {
            const propiedadActual = propiedades[currentIndex];
            if (propiedadActual) {
              router.push(`/propiedad/${propiedadActual.id}` as any);
            }
          }}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-md justify-center items-center active:bg-blue-50"
        >
          <Info size={20} color="#2563eb" strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Botón Like (Corazón) */}
        <TouchableOpacity
          onPress={() => swipeCard('right')}
          activeOpacity={0.8}
          className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-md justify-center items-center active:bg-emerald-50"
        >
          <Heart size={28} color="#10b981" strokeWidth={2.5} fill="#10b981" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: width - 32,
    height: CARD_HEIGHT,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Filtro oscuro para contraste
    // Creación de degradado visual mediante superposición
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 100 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  badgeLike: {
    position: 'absolute',
    top: 40,
    left: 40,
    borderWidth: 4,
    borderColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    transform: [{ rotate: '-15deg' }],
  },
  badgeLikeText: {
    color: '#10b981',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  badgeNope: {
    position: 'absolute',
    top: 40,
    right: 40,
    borderWidth: 4,
    borderColor: '#f43f5e',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 5,
    transform: [{ rotate: '15deg' }],
  },
  badgeNopeText: {
    color: '#f43f5e',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  }
});
