import { useAuth } from '@/context/auth-context';
import { SIGN_CONTRACT } from '@/graphql/mutations';
import { GET_CONTRATO, GET_CONTRATOS } from '@/graphql/queries';
import { useMutation } from '@apollo/client/react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle, PenTool, RefreshCw } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';


export default function FirmarScreen() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState(false);

  const [signContract] = useMutation(SIGN_CONTRACT, {
  refetchQueries: [
    {
      query: GET_CONTRATO,
      variables: { id: Number(id) },
    },
    {
      query: GET_CONTRATOS,
    },
  ],
  awaitRefetchQueries: true,
});

  const handleOK = async (signature: string) => {
    setLoading(true);
    try {
      const base64 = signature.replace('data:image/png;base64,', '');
      // console.log(base64);
      console.log(id);
      console.log(
        'Tamaño firma:',
        base64.length
      );
      const signerType =
        usuario?.rolId === 3
          ? 'CLIENT'
          : 'AGENT';

      await signContract({
        variables: {
          input: {
            contractId: Number(id),
            signerType,
            signatureBase64: base64,
          },
        },
      });

      Alert.alert('Éxito', 'Tu firma digital ha sido registrada y encriptada correctamente.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.log(
        'ERROR COMPLETO'
      );

      console.log(error);

      console.log(
        JSON.stringify(
          error,
          null,
          2
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // Botones de control manuales para mayor integración visual en la App
  const limpiarLienzo = () => ref.current?.clearSignature();
  const guardarLienzo = () => ref.current?.readSignature();

  // Estilos CSS que se inyectan a la WebView del Canvas para que combine con Tailwind
  const customWebStyle = `
    .m-signature-pad { 
      box-shadow: none; 
      border: none; 
      background-color: #ffffff;
    }
    .m-signature-pad--body { 
      border: 2px dashed #cbd5e1; 
      border-radius: 16px;
      background-color: #f8fafc;
    }
    .m-signature-pad--footer { 
      display: none; /* Ocultamos el footer nativo gris para usar nuestros propios botones de la app */
    }
    body, html { 
      background-color: #f8fafc; 
    }
  `;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* HEADER DE NAVEGACIÓN */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          className="p-2 -ml-2"
        >
          <ArrowLeft size={22} color="#334155" />
        </TouchableOpacity>
        <Text className="text-slate-900 font-extrabold text-base tracking-tight">
          Firma de Conformidad
        </Text>
        <View className="w-8" />
      </View>

      {/* BLOQUE INFORMATIVO */}
      <View className="p-4 bg-white m-4 rounded-2xl border border-slate-100 shadow-sm">
        <View className="flex-row items-center mb-1.5">
          <PenTool size={16} color="#2563eb" className="mr-2" />
          <Text className="text-slate-900 font-bold text-sm">Firma digital biométrica</Text>
        </View>
        <Text className="text-slate-500 text-xs leading-relaxed">
          Dibuje su rúbrica dentro del recuadro punteado. Al presionar guardar, su firma se procesará junto con el hash criptográfico del contrato #{id}.
        </Text>
      </View>

      {/* CONTENEDOR DEL LIENZO DE FIRMA */}
      <View className="flex-1 px-4 pb-4">
        <View className="flex-1 rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
          <SignatureScreen
            ref={ref}
            onOK={handleOK}
            webStyle={customWebStyle}
            autoClear={false}
          />

          {loading && (
            <View className="absolute inset-0 bg-white/80 justify-center items-center z-50">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-slate-600 text-xs font-semibold mt-2">
                Registrando firma en el contrato...
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* BARRA INFERIOR DE ACCIONES RÁPIDAS */}
      <View className="flex-row gap-3 px-4 pt-2 pb-6 bg-white border-t border-slate-100">
        {/* Botón: Limpiar */}
        <TouchableOpacity
          onPress={limpiarLienzo}
          disabled={loading}
          activeOpacity={0.7}
          className="flex-1 flex-row justify-center items-center py-4 bg-slate-100 rounded-xl active:bg-slate-200"
        >
          <RefreshCw size={16} color="#475569" className="mr-2" />
          <Text className="text-slate-700 text-sm font-bold">Limpiar</Text>
        </TouchableOpacity>

        {/* Botón: Guardar */}
        <TouchableOpacity
          onPress={guardarLienzo}
          disabled={loading}
          activeOpacity={0.8}
          className="flex-2 flex-row justify-center items-center py-4 bg-emerald-600 rounded-xl shadow-sm active:bg-emerald-700 px-8"
        >
          <CheckCircle size={16} color="#ffffff" className="mr-2" />
          <Text className="text-white text-sm font-bold">Confirmar Firma</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}