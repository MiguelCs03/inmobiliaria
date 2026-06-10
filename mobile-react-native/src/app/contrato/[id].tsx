import { GET_CONTRATO } from '@/graphql/queries';
import { useQuery } from '@apollo/client/react';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard'; // Opcional: para copiar Hashes/IDs
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  FileText,
  PenTool,
  ShieldCheck
} from 'lucide-react-native';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function ContratoDetalleScreen() {
  const { id } = useLocalSearchParams();

  const {
    data,
    loading,
    error,
    refetch,
  } = useQuery<any>(GET_CONTRATO, {
    variables: { id: Number(id) },
    skip: !id,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  useFocusEffect(
    useCallback(() => {
      if (id) {
        refetch();
      }
    }, [id, refetch])
  );

  const contrato = data?.contrato?.data;

  // Cantidad total de firmas registradas
  const totalFirmas = contrato?.firmas?.length ?? 0;

  // Un contrato se considera completamente firmado cuando tiene 2 firmas o más
  const contratoCompleto = totalFirmas >= 2;

  // Estado visual del contrato
  const esActivo =
    contrato?.estadoContrato?.toLowerCase() === 'activo' ||
    contrato?.estadoContrato?.toLowerCase() === 'firmado';

  // Función para copiar datos largos (Blockchain ID / Hash) al portapapeles
  const copiarAlPortapapeles = async (texto: string, campo: string) => {
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado', `${campo} copiado al portapapeles.`);
  };

  // 1. RENDER: Estado de Carga
  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-slate-500 text-sm mt-3 font-semibold">
          Obteniendo datos de auditoría...
        </Text>
      </View>
    );
  }

  // 2. RENDER: Estado de Error
  if (error || !contrato) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6">
        <ShieldCheck size={50} color="#f43f5e" />
        <Text className="text-slate-900 text-lg font-bold mt-4 mb-2">
          Error al cargar el contrato
        </Text>
        <Text className="text-slate-500 text-sm text-center mb-6">
          {error ? error.message : 'El contrato solicitado no está disponible.'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm"
        >
          <Text className="text-slate-700 font-bold text-sm">Volver atrás</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* CABECERA DE LA PANTALLA */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#334155" />
        </TouchableOpacity>
        <Text className="text-slate-900 font-extrabold text-base tracking-tight">
          Detalle del Contrato
        </Text>
        <View className="w-8" /> {/* Spacer para centrar el título */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* ENCABEZADO: Título y Estado */}
        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
          <View className="flex-row justify-between items-start gap-4 mb-3">
            <Text className="text-slate-900 text-xl font-black flex-1 leading-tight">
              {contrato.titulo || 'Contrato sin título'}
            </Text>
            <View className={`px-3 py-1 rounded-full ${esActivo ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <Text className={`text-[10px] font-bold uppercase tracking-wider ${esActivo ? 'text-emerald-700' : 'text-amber-700'}`}>
                {contrato.estadoContrato}
              </Text>
            </View>
          </View>
          <Text className="text-slate-400 text-xs">ID de Registro Interno: #{id}</Text>
        </View>

        {/* SECCIÓN: Auditoría Blockchain */}
        <Text className="text-slate-900 text-sm font-bold uppercase tracking-wider ml-1 mb-2">
          Auditoría Digital & Blockchain
        </Text>

        <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-5 gap-y-4">
          {/* Blockchain ID */}
          <View>
            <View className="flex-row items-center mb-1">
              <Cpu size={14} color="#64748b" className="mr-1.5" />
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Blockchain Contract ID</Text>
            </View>
            <TouchableOpacity
              onPress={() => copiarAlPortapapeles(contrato.blockchainContractId, 'Blockchain ID')}
              className="flex-row justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
            >
              <Text numberOfLines={1} className="text-slate-700 font-mono text-xs flex-1 pr-2">
                {contrato.blockchainContractId || 'No emitido aún'}
              </Text>
              {contrato.blockchainContractId && <Copy size={14} color="#94a3b8" />}
            </TouchableOpacity>
          </View>

          {/* Document Hash */}
          <View>
            <View className="flex-row items-center mb-1">
              <ShieldCheck size={14} color="#64748b" className="mr-1.5" />
              <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hash de Documento (SHA-256)</Text>
            </View>
            <TouchableOpacity
              onPress={() => copiarAlPortapapeles(contrato.documentHash, 'Hash')}
              className="flex-row justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100"
            >
              <Text numberOfLines={1} className="text-slate-700 font-mono text-xs flex-1 pr-2">
                {contrato.documentHash || 'Pendiente de firma original'}
              </Text>
              {contrato.documentHash && <Copy size={14} color="#94a3b8" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* SECCIÓN: Firmantes (Timeline UI) */}
        <Text className="text-slate-900 text-sm font-bold uppercase tracking-wider ml-1 mb-2">
          Estatus de Firmas
        </Text>

        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
          {contrato.firmas && contrato.firmas.length > 0 ? (
            contrato.firmas.map((firma: any, index: number) => (
              <View key={firma.id || index} className="flex-row">
                {/* Diseño de la Línea de Tiempo */}
                <View className="items-center mr-4">
                  <View className="bg-emerald-100 p-1.5 rounded-full z-10">
                    <CheckCircle2 size={16} color="#10b981" />
                  </View>
                  {index !== contrato.firmas.length - 1 && (
                    <View className="w-[2px] bg-slate-100 flex-1 my-1" />
                  )}
                </View>

                {/* Datos de la Firma */}
                <View className="flex-1 pb-5">
                  <Text className="text-slate-900 font-bold text-sm capitalize">
                    {firma.tipoFirmante?.replace('_', ' ')}
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#94a3b8" className="mr-1" />
                    <Text className="text-slate-400 text-xs">
                      {new Date(firma.fechaFirma).toLocaleString('es-ES', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="items-center py-4">
              <Clock size={32} color="#94a3b8" />
              <Text className="text-slate-500 text-sm mt-2">Este contrato no registra firmas aún.</Text>
            </View>
          )}
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View className="gap-y-3 mt-2">
          {/* Botón Primario: Ver PDF */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push({
              pathname: '/contrato/pdf/[id]',
              params: { id: contrato.id.toString() },
            })}
            className="flex-row justify-center items-center py-4 bg-corporate-600 rounded-xl shadow-sm active:bg-corporate-700"
          >
            <FileText size={18} color="#ffffff" className="mr-2" />
            <Text className="text-white text-sm font-bold">Visualizar PDF Original</Text>
          </TouchableOpacity>

          {/* Botón Secundario/Condicional: Firmar Contrato (Se oculta por completo si contratoCompleto es true) */}
          {!contratoCompleto && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/contrato/firmar/[id]',
                  params: {
                    id: contrato.id.toString(),
                  },
                })
              }
              className="flex-row justify-center items-center py-4 bg-emerald-600 rounded-xl shadow-sm active:bg-emerald-700"
            >
              <PenTool size={18} color="#ffffff" />
              <Text className="text-white text-sm font-bold ml-2">
                Proceder a Firmar Contrato
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}