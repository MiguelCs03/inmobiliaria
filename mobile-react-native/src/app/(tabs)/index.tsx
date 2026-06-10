import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Pressable,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  Search,
  Home,
  Building2,
  Layers,
  MapPin,
  Maximize2,
  User,
  Grid,
  ArrowRight,
  LogOut,
  LogIn,
  RefreshCw,
  Heart
} from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import {
  MAP_TIPO_PROPIEDAD,
  MAP_TIPO_OPERACION,
  MAP_ESTADO_PROPIEDAD
} from '@/constants/properties';

// Query de GraphQL para obtener las propiedades a través del API Gateway
const QUERY_PROPIEDADES = gql`
  query GetPropiedades {
    propiedades {
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { usuario, cerrarSesion } = useAuth();

  // Estados para búsqueda y filtrado
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'casa' | 'departamento' | 'terreno' | 'oficina'>('todos');

  // Query de Apollo Client
  const { data, loading, error, refetch } = useQuery<any>(QUERY_PROPIEDADES, {
    fetchPolicy: 'cache-and-network'
  });

  // Extraer array de propiedades
  const propiedades = useMemo(() => {
    return data?.propiedades?.data || [];
  }, [data]);

  // Filtrado de propiedades basado en búsqueda y tipo
  const propiedadesFiltradas = useMemo(() => {
    return propiedades.filter((prop: any) => {
      const ubicacionStr = prop.ubicacion || '';
      const tipoStr = MAP_TIPO_PROPIEDAD[prop.tipoPropiedadId] || '';
      const operacionStr = MAP_TIPO_OPERACION[prop.tipoOperacionId] || '';

      const coincideBusqueda =
        ubicacionStr.toLowerCase().includes(busqueda.toLowerCase()) ||
        tipoStr.toLowerCase().includes(busqueda.toLowerCase()) ||
        operacionStr.toLowerCase().includes(busqueda.toLowerCase());

      const coincideTipo =
        filtroTipo === 'todos' ? true : tipoStr === filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }, [propiedades, busqueda, filtroTipo]);

  // Formateador de moneda
  const formatearPrecio = (precio: number, tipoOperacionId: number) => {
    const precioFormateado = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(precio);

    return tipoOperacionId === 2 ? `${precioFormateado} / mes` : precioFormateado;
  };

  // Renderizador de cada tarjeta de propiedad
  const renderPropiedad = ({ item }: { item: any }) => {
    const estadoNombre = MAP_ESTADO_PROPIEDAD[item.estadoPropiedadId] || 'Disponible';
    const tipoNombre = MAP_TIPO_PROPIEDAD[item.tipoPropiedadId] || 'casa';
    const operacionNombre = MAP_TIPO_OPERACION[item.tipoOperacionId] || 'venta';

    // Definición de colores según el estado
    const colorEstado = {
      Disponible: 'bg-emerald-500',
      Reservado: 'bg-amber-500',
      Vendido: 'bg-slate-500'
    }[estadoNombre] || 'bg-slate-500';

    // Resolver imagen (usar fallback si no hay imágenes en la BD)
    const imagenUrl = item.imagenes && item.imagenes.length > 0
      ? item.imagenes[0].urlS3
      : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';

    // Componer título dinámico
    const tituloCompuesto = `${tipoNombre.charAt(0).toUpperCase() + tipoNombre.slice(1)} en ${item.ubicacion?.split(',')[0] || 'Zona Residencial'}`;

    return (
      <Pressable
        onPress={() => router.push(`/propiedad/${item.id}`)}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-5 shadow-sm active:opacity-95"
      >
        {/* Imagen de Portada con Badge de Estado Flotante */}
        <View className="relative">
          <Image
            source={{ uri: imagenUrl }}
            style={{ width: '100%', height: 200 }}
            contentFit="cover"
            transition={300}
          />
          {/* Badge de Estado */}
          <View className={`absolute top-3 left-3 px-3 py-1 rounded-full ${colorEstado}`}>
            <Text className="text-white text-[10px] font-bold tracking-wider">
              {estadoNombre.toUpperCase()}
            </Text>
          </View>
          {/* Badge de Operación (Venta / Alquiler) */}
          <View className="absolute bottom-3 right-3 bg-slate-900/80 px-3 py-1 rounded-lg">
            <Text className="text-white text-xs font-semibold capitalize">
              {operacionNombre}
            </Text>
          </View>
        </View>

        {/* Información de la Propiedad */}
        <View className="p-4">
          <Text className="text-2xl font-extrabold text-slate-900">
            {formatearPrecio(item.precioBase, item.tipoOperacionId)}
          </Text>

          <Text className="text-base font-bold text-slate-800 mt-1 mb-2" numberOfLines={1}>
            {tituloCompuesto}
          </Text>

          {/* Dirección rápida */}
          <View className="flex-row items-center mb-3">
            <MapPin size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs ml-1 flex-1 font-medium" numberOfLines={1}>
              {item.ubicacion || 'Ubicación no registrada'}
            </Text>
          </View>

          {/* Fila Inferior: Detalles de área y BOTÓN DE ACCIÓN EXPLICÍTO */}
          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-100">
            {/* Metadatos rápidos */}
            <View className="flex-row items-center">
              <View className="flex-row items-center mr-4">
                <Maximize2 size={14} color="#64748b" />
                <Text className="text-slate-600 text-xs ml-1 font-semibold">
                  {item.areaM2} m²
                </Text>
              </View>
              <View className="flex-row items-center">
                <Home size={14} color="#64748b" />
                <Text className="text-slate-600 text-xs ml-1 font-semibold capitalize">
                  {tipoNombre}
                </Text>
              </View>
            </View>

            {/* BOTÓN EXPLICÍTO DE VER DETALLES */}
            <TouchableOpacity
              onPress={() => router.push(`/propiedad/${item.id}`)}
              className="bg-corporate-600 px-3.5 py-2 rounded-xl flex-row items-center active:bg-corporate-700 shadow-sm"
            >
              <Text className="text-white text-xs font-bold mr-1">
                Ver Detalles
              </Text>
              <ArrowRight size={13} color="#ffffff" />
            </TouchableOpacity>
          </View>

        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      {/* 1. CABECERA CORPORATIVA CON BANNER AZUL */}
      <View
        className="bg-corporate-950 rounded-b-[32px] shadow-lg relative overflow-hidden"
        style={{ paddingTop: insets.top + 12, paddingBottom: 36 }}
      >

        <View className="flex-row justify-between items-center px-4 relative z-10">
          <View className="flex-1 mr-2">
            {usuario ? (
              <>
                <Text className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-0.5" numberOfLines={1}>
                  Sesión: {usuario.correo}
                </Text>
                <Text className="text-white text-xl font-black tracking-tight">
                  Agente <Text className="text-blue-300">Conectado</Text>
                </Text>
              </>
            ) : (
              <>
                <Text className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  Catálogo Público de Inmuebles
                </Text>
                <Text className="text-white text-2xl font-black tracking-tight">
                  EstateCore <Text className="text-blue-300">ERP</Text>
                </Text>
              </>
            )}
          </View>

          {/* Botones de Autenticación en Cabecera */}
          <View className="flex-row items-center gap-2">
            {usuario ? (
              <>
                {/* Botón Cerrar Sesión */}
                <TouchableOpacity
                  onPress={cerrarSesion}
                  className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 justify-center items-center backdrop-blur-md active:bg-rose-500/35"
                >
                  <LogOut size={18} color="#f43f5e" />
                </TouchableOpacity>
                <View className="w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center backdrop-blur-md">
                  <User size={20} color="#ffffff" />
                </View>
              </>
            ) : (
              <>
                {/* Botón Iniciar Sesión */}
                <TouchableOpacity
                  onPress={() => router.push('/login')}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center backdrop-blur-md active:bg-white/20"
                >
                  <LogIn size={18} color="#ffffff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* 2. BARRA DE BÚSQUEDA FLOTANTE Y BOTÓN DE MAPA */}
      <View className="mt-[-24px] mx-4 z-20 flex-row gap-2 shadow-sm">
        <View className="flex-1 flex-row items-center bg-white rounded-2xl px-4 py-3 border border-slate-100">
          <Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2.5 text-slate-800 text-sm font-medium"
            placeholder="Buscar por zona, tipo u operación..."
            placeholderTextColor="#94a3b8"
            value={busqueda}
            onChangeText={setBusqueda}
            autoCorrect={false}
          />
          {/* Botón de Refrescar Datos */}
          <TouchableOpacity onPress={() => refetch()} className="ml-1 p-1 active:opacity-60">
            <RefreshCw size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
        
        {/* Botón Mapa */}
        <TouchableOpacity
          onPress={() => router.push('/mapa')}
          className="bg-corporate-600 px-4 rounded-2xl justify-center items-center active:bg-corporate-700"
        >
          <MapPin size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Contenedor del Catálogo y Filtros */}
      <View className="flex-1 px-4 pt-6">

        {/* FILTROS DINÁMICOS */}
        <View className="mb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 8 }}
          >
            {/* Botón: Todos */}
            <TouchableOpacity
              onPress={() => setFiltroTipo('todos')}
              className={`flex-row items-center px-4 py-2 rounded-xl mr-2 border ${filtroTipo === 'todos'
                ? 'bg-corporate-600 border-corporate-600'
                : 'bg-white border-slate-200'
                }`}
            >
              <Grid size={15} color={filtroTipo === 'todos' ? '#ffffff' : '#475569'} />
              <Text
                className={`ml-1.5 text-xs font-bold ${filtroTipo === 'todos' ? 'text-white' : 'text-slate-600'
                  }`}
              >
                Todos
              </Text>
            </TouchableOpacity>

            {/* Botón: Matchmaking (Solo para Cliente) */}
            {usuario?.rolId === 3 && (
              <TouchableOpacity
                onPress={() => router.push('/swipe' as any)}
                className="flex-row items-center px-4 py-2 rounded-xl mr-2 border bg-white border-slate-200"
              >
                <Heart size={15} color="#f43f5e" fill="#f43f5e" />
                <Text className="ml-1.5 text-xs font-bold text-slate-600">
                  Matchmaking
                </Text>
              </TouchableOpacity>
            )}

            {/* Botón: Contratos */}
            <TouchableOpacity
              onPress={() => router.push('/contratos')}
              className="flex-row items-center px-4 py-2 rounded-xl mr-2 border bg-white border-slate-200"
            >
              <Layers
                size={15}
                color="#475569"
              />

              <Text
                className="ml-1.5 text-xs font-bold text-slate-600"
              >
                Contratos
              </Text>

            </TouchableOpacity>

            {/* Botón: Reservar Cita */}
            <TouchableOpacity
              onPress={() => router.push('/reservar' as any)}
              className="flex-row items-center px-4 py-2 rounded-xl mr-2 border bg-white border-slate-200"
            >
              <Grid
                size={15}
                color="#475569"
              />
              <Text
                className="ml-1.5 text-xs font-bold text-slate-600"
              >
                Reservar Cita
              </Text>
            </TouchableOpacity>

            {/* Botón: Casas */}
            <TouchableOpacity
              onPress={() => setFiltroTipo('casa')}
              className={`flex-row items-center px-4 py-2 rounded-xl mr-2 border ${filtroTipo === 'casa'
                ? 'bg-corporate-600 border-corporate-600'
                : 'bg-white border-slate-200'
                }`}
            >
              <Home size={15} color={filtroTipo === 'casa' ? '#ffffff' : '#475569'} />
              <Text
                className={`ml-1.5 text-xs font-bold ${filtroTipo === 'casa' ? 'text-white' : 'text-slate-600'
                  }`}
              >
                Casas
              </Text>
            </TouchableOpacity>

            {/* Botón: Departamentos */}
            <TouchableOpacity
              onPress={() => setFiltroTipo('departamento')}
              className={`flex-row items-center px-4 py-2 rounded-xl mr-2 border ${filtroTipo === 'departamento'
                ? 'bg-corporate-600 border-corporate-600'
                : 'bg-white border-slate-200'
                }`}
            >
              <Building2 size={15} color={filtroTipo === 'departamento' ? '#ffffff' : '#475569'} />
              <Text
                className={`ml-1.5 text-xs font-bold ${filtroTipo === 'departamento' ? 'text-white' : 'text-slate-600'
                  }`}
              >
                Departamentos
              </Text>
            </TouchableOpacity>

            {/* Botón: Terrenos */}
            <TouchableOpacity
              onPress={() => setFiltroTipo('terreno')}
              className={`flex-row items-center px-4 py-2 rounded-xl mr-2 border ${filtroTipo === 'terreno'
                ? 'bg-corporate-600 border-corporate-600'
                : 'bg-white border-slate-200'
                }`}
            >
              <Layers size={15} color={filtroTipo === 'terreno' ? '#ffffff' : '#475569'} />
              <Text
                className={`ml-1.5 text-xs font-bold ${filtroTipo === 'terreno' ? 'text-white' : 'text-slate-600'
                  }`}
              >
                Terrenos
              </Text>
            </TouchableOpacity>

            {/* Botón: Oficinas */}
            <TouchableOpacity
              onPress={() => setFiltroTipo('oficina')}
              className={`flex-row items-center px-4 py-2 rounded-xl border ${filtroTipo === 'oficina'
                ? 'bg-corporate-600 border-corporate-600'
                : 'bg-white border-slate-200'
                }`}
            >
              <Building2 size={15} color={filtroTipo === 'oficina' ? '#ffffff' : '#475569'} />
              <Text
                className={`ml-1.5 text-xs font-bold ${filtroTipo === 'oficina' ? 'text-white' : 'text-slate-600'
                  }`}
              >
                Oficinas
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 3. LISTADO DE PROPIEDADES REALES DESDE GRAPHQL */}
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-slate-500 text-sm mt-3 font-semibold">
              Obteniendo propiedades de la base de datos...
            </Text>
          </View>
        ) : error ? (
          <View className="py-12 items-center justify-center bg-white rounded-2xl border border-rose-100 p-6 shadow-sm">
            <Layers size={44} color="#f43f5e" />
            <Text className="text-rose-600 text-sm font-bold mt-4 text-center">
              Error de Conexión
            </Text>
            <Text className="text-slate-400 text-xs mt-1 text-center leading-relaxed">
              No se pudo conectar con el API Gateway GraphQL en {process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://10.0.2.2:3001/graphql'}.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-4 bg-corporate-600 px-4 py-2 rounded-xl"
            >
              <Text className="text-white text-xs font-bold">Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={propiedadesFiltradas}
            renderItem={renderPropiedad}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="py-12 items-center justify-center bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <Layers size={44} color="#94a3b8" />
                <Text className="text-slate-800 text-sm font-bold mt-4 text-center">
                  Sin propiedades
                </Text>
                <Text className="text-slate-400 text-xs mt-1 text-center">
                  No hay inmuebles disponibles que coincidan con la búsqueda.
                </Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </View>
  );
}