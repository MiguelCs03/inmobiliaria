import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  Home,
  Building2,
  Layers,
  Tag,
  Phone,
  MessageSquare,
  ChevronLeft
} from 'lucide-react-native';
import {
  MAP_TIPO_PROPIEDAD,
  MAP_TIPO_OPERACION,
  MAP_ESTADO_PROPIEDAD,
  MOCK_AGENTES,
  Agente
} from '@/constants/properties';

// Query de GraphQL para obtener los detalles de una propiedad por su ID entero
const QUERY_PROPIEDAD_DETALLE = gql`
  query GetPropiedadDetalle($id: Int!) {
    propiedad(id: $id) {
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

// Query de GraphQL para obtener los detalles del propietario
const QUERY_PROPIETARIO_DETALLE = gql`
  query GetPropietarioDetalle($id: Int!) {
    propietario(id: $id) {
      success
      message
      data {
        id
        nombres
        telefono
        ciNit
        fotoUrl
      }
    }
  }
`;

export default function PropiedadDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Convertir el parámetro string de ID en un entero para GraphQL
  const propiedadId = useMemo(() => {
    return id ? parseInt(id, 10) : 0;
  }, [id]);

  // Consulta de Apollo Client para la propiedad
  const { data, loading, error, refetch } = useQuery<any>(QUERY_PROPIEDAD_DETALLE, {
    variables: { id: propiedadId },
    skip: !propiedadId
  });

  // Extraer la propiedad
  const propiedad = data?.propiedad?.data;

  // Consulta del propietario real
  const propietarioId = propiedad?.propietarioId;
  const { data: ownerData, loading: ownerLoading } = useQuery<any>(QUERY_PROPIETARIO_DETALLE, {
    variables: { id: propietarioId },
    skip: !propietarioId
  });

  const propietario = ownerData?.propietario?.data;

  // Estado para la galería de imágenes
  const [imagenActivaIndex, setImagenActivaIndex] = useState(0);

  // Formateador de precio
  const formatearPrecio = (precio: number, tipoOperacionId: number) => {
    const precioFormateado = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(precio);

    return tipoOperacionId === 2 ? `${precioFormateado} / mes` : precioFormateado;
  };

  // Asignar un agente simulado para dar soporte de contacto
  const agenteAsignado: Agente = useMemo(() => {
    // Rotar agentes basados en el ID para dinamismo
    const agentes = Object.values(MOCK_AGENTES);
    const index = propiedadId % agentes.length;
    return agentes[index] || MOCK_AGENTES.alejandro;
  }, [propiedadId]);

  // Enlace para realizar llamada telefónica al agente/propietario
  const iniciarLlamada = async (telefono: string) => {
    try {
      const url = `tel:${telefono}`;
      const soportado = await Linking.canOpenURL(url);
      if (soportado) {
        await Linking.openURL(url);
      } else {
        console.warn('El dispositivo no soporta llamadas telefónicas:', url);
      }
    } catch (error) {
      console.error('Error al intentar realizar la llamada:', error);
    }
  };

  // Enlace para enviar un correo electrónico al agente
  const enviarCorreo = async (email: string, tituloPropiedad: string) => {
    try {
      const asunto = encodeURIComponent(`Consulta sobre propiedad ID: ${propiedadId}`);
      const cuerpo = encodeURIComponent(`Hola, me gustaría recibir más información sobre el inmueble ubicado en: ${tituloPropiedad}.`);
      const url = `mailto:${email}?subject=${asunto}?body=${cuerpo}`;
      
      const soportado = await Linking.canOpenURL(url);
      if (soportado) {
        await Linking.openURL(url);
      } else {
        console.warn('El dispositivo no soporta el envío de correos:', url);
      }
    } catch (error) {
      console.error('Error al intentar enviar el correo:', error);
    }
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-500 text-sm mt-3 font-semibold">
          Cargando detalles desde la base de datos...
        </Text>
      </View>
    );
  }

  // Renderizar error si falla la query
  if (error || !propiedad) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
        <View className="items-center">
          <Layers size={60} color="#f43f5e" />
          <Text className="text-slate-900 text-lg font-bold mt-4 mb-2">
            Error al Cargar la Propiedad
          </Text>
          <Text className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
            {error ? 'No se pudo establecer conexión con el API Gateway GraphQL.' : 'El inmueble consultado no existe o fue retirado.'}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-white border border-slate-200 px-5 py-3 rounded-xl active:bg-slate-50"
            >
              <Text className="text-slate-700 font-bold text-sm">Reintentar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              className="bg-corporate-600 px-5 py-3 rounded-xl shadow-sm active:bg-corporate-700"
            >
              <Text className="text-white font-bold text-sm">Volver al Catálogo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Mapeos relacionales locales
  const estadoNombre = MAP_ESTADO_PROPIEDAD[propiedad.estadoPropiedadId] || 'Disponible';
  const tipoNombre = MAP_TIPO_PROPIEDAD[propiedad.tipoPropiedadId] || 'casa';
  const operacionNombre = MAP_TIPO_OPERACION[propiedad.tipoOperacionId] || 'venta';

  // Seleccionar icono correcto para el tipo de propiedad
  const IconoTipoPropiedad = () => {
    switch (tipoNombre) {
      case 'casa':
        return <Home size={20} color="#2563eb" />;
      case 'departamento':
        return <Building2 size={20} color="#2563eb" />;
      case 'terreno':
        return <Layers size={20} color="#2563eb" />;
      case 'oficina':
        return <Building2 size={20} color="#2563eb" />;
      default:
        return <Home size={20} color="#2563eb" />;
    }
  };

  // Definición de colores según el estado
  const colorEstado = {
    Disponible: 'bg-emerald-500',
    Reservado: 'bg-amber-500',
    Vendido: 'bg-slate-500'
  }[estadoNombre] || 'bg-slate-500';

  // Resolver imágenes de la propiedad
  const imagenes = propiedad.imagenes || [];
  const imagenUrl = imagenes.length > 0 && imagenes[imagenActivaIndex]?.urlS3
    ? imagenes[imagenActivaIndex].urlS3
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';

  const tituloCompuesto = `${tipoNombre.charAt(0).toUpperCase() + tipoNombre.slice(1)} en ${propiedad.ubicacion?.split(',')[0] || 'Zona Residencial'}`;

  // Descripción simulada de alta calidad en base a los datos
  const descripcionPropiedad = `Excelente oportunidad: ${tituloCompuesto} ubicada en ${propiedad.ubicacion || 'zona privilegiada'}. Cuenta con una superficie total registrada de ${propiedad.areaM2} metros cuadrados con todos los papeles al día y listos para transferencia. Ideal para vivienda familiar o inversión patrimonial de alto retorno.`;

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />
      
      {/* Botón de Retorno Flotante */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 w-10 h-10 rounded-full bg-white/95 justify-center items-center border border-slate-100 shadow-md active:bg-slate-50"
      >
        <ChevronLeft size={24} color="#1e3a8a" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* GALERÍA DE IMÁGENES / HERO */}
        <View className="relative w-full h-80 bg-slate-900">
          <Image
            source={{ uri: imagenUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
          />
        </View>

        {imagenes.length > 1 && (
          <View className="bg-slate-950 py-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {imagenes.map((img: any, idx: number) => (
                <TouchableOpacity
                  key={img.id || idx}
                  onPress={() => setImagenActivaIndex(idx)}
                  className={`mr-3 rounded-xl overflow-hidden border-2 ${
                    imagenActivaIndex === idx ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    source={{ uri: img.urlS3 }}
                    style={{ width: 64, height: 64 }}
                    contentFit="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Contenido Principal */}
        <View className="bg-slate-50 px-5 pt-6 pb-12 -mt-6 rounded-t-3xl shadow-lg">
          
          {/* Fila de Badges */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className={`px-3 py-1 rounded-full ${colorEstado}`}>
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                {estadoNombre}
              </Text>
            </View>
            <View className="bg-corporate-950 px-3 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                {operacionNombre}
              </Text>
            </View>
          </View>

          {/* Título de la propiedad */}
          <Text className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
            {tituloCompuesto}
          </Text>

          {/* Dirección registrada */}
          <View className="flex-row items-center mb-6">
            <MapPin size={15} color="#64748b" />
            <Text className="text-slate-500 text-sm ml-1.5 flex-1 font-semibold">
              {propiedad.ubicacion || 'Ubicación no registrada'}
            </Text>
          </View>

          {/* FICHA TÉCNICA E INFORMACIÓN ESTRUCTURADA */}
          
          {/* Bloque de Precio Destacado */}
          <View className="bg-white p-5 rounded-2xl border border-slate-100 mb-6 shadow-sm">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Valor de Operación
            </Text>
            <Text className="text-3xl font-black text-corporate-600">
              {formatearPrecio(propiedad.precioBase, propiedad.tipoOperacionId)}
            </Text>
          </View>

          {/* Cuadrícula de Metadatos (Grid) */}
          <View className="flex-row justify-between gap-3 mb-6">
            
            {/* Metadato: Tipo de Propiedad */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
              <View className="p-2.5 bg-blue-50 rounded-xl">
                <IconoTipoPropiedad />
              </View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-2 mb-0.5">
                Tipo
              </Text>
              <Text className="text-slate-800 text-xs font-bold capitalize">
                {tipoNombre}
              </Text>
            </View>

            {/* Metadato: Tipo de Operación */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
              <View className="p-2.5 bg-blue-50 rounded-xl">
                <Tag size={20} color="#2563eb" />
              </View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-2 mb-0.5">
                Operación
              </Text>
              <Text className="text-slate-800 text-xs font-bold capitalize">
                {operacionNombre}
              </Text>
            </View>

            {/* Metadato: Área */}
            <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center">
              <View className="p-2.5 bg-blue-50 rounded-xl">
                <Maximize2 size={20} color="#2563eb" />
              </View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-2 mb-0.5">
                Superficie
              </Text>
              <Text className="text-slate-800 text-xs font-bold">
                {propiedad.areaM2} m²
              </Text>
            </View>

          </View>

          {/* Descripción Ampliada */}
          <View className="mb-6">
            <Text className="text-slate-900 text-lg font-bold mb-2">
              Descripción del Inmueble
            </Text>
            <Text className="text-slate-600 text-sm leading-relaxed font-normal">
              {descripcionPropiedad}
            </Text>
          </View>

          {/* Tarjeta del Propietario (Datos Reales de la BD) */}
          {propietario && (
            <View className="mb-6">
              <Text className="text-slate-900 text-lg font-bold mb-3">
                Propietario / Vendedor
              </Text>
              
              <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <View className="flex-row items-center">
                  {/* Foto de Perfil del Propietario */}
                  <Image
                    source={{ 
                      uri: propietario.fotoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop' 
                    }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                    contentFit="cover"
                    transition={200}
                  />
                  
                  {/* Datos del Propietario */}
                  <View className="ml-4 flex-1">
                    <Text className="text-slate-900 text-base font-bold">
                      {propietario.nombres}
                    </Text>
                    <Text className="text-slate-500 text-xs font-semibold mt-0.5">
                      Teléfono: {propietario.telefono}
                    </Text>
                    <Text className="text-slate-400 text-[10px] font-semibold mt-0.5 uppercase tracking-wider">
                      Identificación (CI/NIT): {propietario.ciNit}
                    </Text>
                  </View>
                </View>

                {/* Botones de acción rápida con el propietario real */}
                <View className="flex-row gap-3 mt-4 border-t border-slate-100 pt-4">
                  
                  {/* Botón: Llamar */}
                  <TouchableOpacity
                    onPress={() => iniciarLlamada(propietario.telefono)}
                    className="flex-1 flex-row justify-center items-center py-3 bg-blue-600 rounded-xl shadow-sm active:bg-blue-700"
                  >
                    <Phone size={15} color="#ffffff" />
                    <Text className="text-white text-xs font-bold ml-1.5">
                      Llamar
                    </Text>
                  </TouchableOpacity>

                  {/* Botón: WhatsApp */}
                  <TouchableOpacity
                    onPress={() => {
                      const telFormateado = propietario.telefono.replace('+', '').replace(/\s/g, '');
                      const url = `https://wa.me/${telFormateado}?text=${encodeURIComponent(`Hola ${propietario.nombres}, estoy interesado en su propiedad de ${tipoNombre} en ${propiedad.ubicacion}.`)}`;
                      Linking.openURL(url).catch(err => console.error("Error al abrir WhatsApp:", err));
                    }}
                    className="flex-1 flex-row justify-center items-center py-3 bg-emerald-600 rounded-xl shadow-sm active:bg-emerald-700"
                  >
                    <MessageSquare size={15} color="#ffffff" />
                    <Text className="text-white text-xs font-bold ml-1.5">
                      WhatsApp
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>
          )}

          {/* Tarjeta del Agente Responsable */}
          <View className="mb-2">
            <Text className="text-slate-900 text-lg font-bold mb-3">
              Agente Representante
            </Text>
            
            <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <View className="flex-row items-center">
                {/* Avatar del Agente */}
                <Image
                  source={{ uri: agenteAsignado.avatarUrl }}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                  transition={200}
                />
                
                {/* Datos del Agente */}
                <View className="ml-4 flex-1">
                  <Text className="text-slate-900 text-base font-bold">
                    {agenteAsignado.nombre}
                  </Text>
                  <Text className="text-slate-500 text-xs font-medium">
                    {agenteAsignado.cargo}
                  </Text>
                </View>
              </View>

              {/* Botones de acción rápida en azul corporativo */}
              <View className="flex-row gap-3 mt-4 border-t border-slate-50 pt-4">
                
                {/* Botón: Llamar */}
                <TouchableOpacity
                  onPress={() => iniciarLlamada(agenteAsignado.telefono)}
                  className="flex-1 flex-row justify-center items-center py-3.5 bg-corporate-600 rounded-xl shadow-sm active:bg-corporate-700"
                >
                  <Phone size={16} color="#ffffff" />
                  <Text className="text-white text-sm font-semibold ml-2">
                    Llamar
                  </Text>
                </TouchableOpacity>

                {/* Botón: Correo */}
                <TouchableOpacity
                  onPress={() => enviarCorreo(agenteAsignado.email, tituloCompuesto)}
                  className="flex-1 flex-row justify-center items-center py-3.5 bg-white border border-slate-200 rounded-xl active:bg-slate-50"
                >
                  <MessageSquare size={16} color="#334155" />
                  <Text className="text-slate-700 text-sm font-semibold ml-2">
                    Mensaje
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
