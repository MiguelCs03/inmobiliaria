import { GET_CONTRATOS } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { AlertCircle, ChevronRight, FileText, RefreshCw } from 'lucide-react-native'; // Íconos premium
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Tipado básico para mejorar el soporte de TypeScript (ajústalo según tu BD)
interface Contrato {
  id: number;
  titulo: string;
  estadoContrato: string;
}

export default function ContratosScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, loading, error, refetch } = useQuery<any>(GET_CONTRATOS, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const contratos: Contrato[] = data?.contratos?.data || [];

  // Manejador del Pull-to-Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  // 1. RENDER: Estado de Carga Inicial
  if (loading && !isRefreshing && contratos.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-500 text-sm mt-3 font-semibold">
          Cargando listado de contratos...
        </Text>
      </View>
    );
  }

  // 2. RENDER: Estado de Error
  if (error && contratos.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
        <AlertCircle size={48} color="#f43f5e" />
        <Text className="text-slate-900 text-lg font-bold mt-4 mb-2">
          Error al cargar datos
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
          {error.message || 'No se pudo conectar con el servidor.'}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="flex-row items-center bg-white border border-slate-200 px-5 py-3 rounded-xl active:bg-slate-50 shadow-sm"
        >
          <RefreshCw size={16} color="#334155" className="mr-2" />
          <Text className="text-slate-700 font-bold text-sm">Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Función dinámica para pintar el badge de estado según tu diseño corporativo
  const renderBadgeEstado = (estado: string) => {
    let bgClass = 'bg-slate-100';
    let textClass = 'text-slate-700';

    switch (estado?.toLowerCase()) {
      case 'activo':
      case 'firmado':
        bgClass = 'bg-emerald-50';
        textClass = 'text-emerald-700';
        break;
      case 'pendiente':
      case 'en revisión':
        bgClass = 'bg-amber-50';
        textClass = 'text-amber-700';
        break;
      case 'vencido':
      case 'cancelado':
        bgClass = 'bg-rose-50';
        textClass = 'text-rose-700';
        break;
    }

    return (
      <View className={`px-2.5 py-1 rounded-md self-start ${bgClass}`}>
        <Text className={`text-[11px] font-bold uppercase tracking-wider ${textClass}`}>
          {estado}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      <FlatList
        data={contratos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50, paddingBottom: 32 }}

        // Pull-to-refresh nativo
        refreshing={isRefreshing}
        onRefresh={handleRefresh}

        // Estado vacío si la query no trae contratos
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <FileText size={50} color="#94a3b8" />
            <Text className="text-slate-900 text-base font-bold mt-4">No hay contratos disponibles</Text>
            <Text className="text-slate-400 text-sm text-center mt-1 px-8">
              Actualmente no posees registros o contratos asignados a tu cuenta.
            </Text>
          </View>
        )}

        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/contrato/[id]',
                params: {
                  id: item.id.toString(),
                },
              })
            }
            activeOpacity={0.7}
            className="bg-white mb-3 p-4 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between"
          >
            {/* Contenedor Izquierdo: Icono + Textos */}
            <View className="flex-row items-center flex-1 pr-4">
              <View className="p-3 bg-blue-50 rounded-xl mr-4">
                <FileText size={22} color="#2563eb" />
              </View>

              <View className="flex-1">
                <Text
                  numberOfLines={1}
                  className="text-slate-900 text-base font-bold mb-1.5 tracking-tight"
                >
                  {item.titulo || 'Contrato sin título'}
                </Text>
                {renderBadgeEstado(item.estadoContrato)}
              </View>
            </View>

            {/* Contenedor Derecho: Flecha indicadora de navegación */}
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}