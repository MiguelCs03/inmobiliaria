import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { Mail, Lock, ChevronLeft, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';

// Mutation de GraphQL para inicio de sesión en NestJS
const MUTATION_LOGIN = gql`
  mutation Login($correo: String!, $contrasenia: String!) {
    login(loginInput: { correo: $correo, contrasenia: $contrasenia }) {
      success
      message
      data {
        token
        usuario {
          id
          correo
          rolId
          fotoUrl
          activo
        }
      }
    }
  }
`;

export default function LoginScreen() {
  const { guardarSesion } = useAuth();

  // Estados locales para el formulario
  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Hook de mutation de Apollo Client
  const [ejecutarLogin, { loading }] = useMutation<any, any>(MUTATION_LOGIN, {
    onError: (err: any) => {
      // Capturar errores de red o del servidor
      setErrorLocal(err.message || 'Error de conexión con el servidor.');
    }
  });

  // Manejo del evento Submit del formulario
  const handleLogin = async () => {
    setErrorLocal(null);

    // Validaciones básicas
    if (!correo.trim() || !contrasenia.trim()) {
      setErrorLocal('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await ejecutarLogin({
        variables: {
          correo: correo.trim(),
          contrasenia: contrasenia
        }
      });

      const resultado = response.data?.login;

      if (resultado && resultado.success && resultado.data) {
        const { token, usuario } = resultado.data;
        // Guardar en SecureStore y actualizar contexto de sesión
        await guardarSesion(token, usuario);
        // Redirigir de regreso al catálogo
        router.replace('/(tabs)');
      } else {
        setErrorLocal(resultado?.message || 'Credenciales incorrectas.');
      }
    } catch (e) {
      // Los errores ya se manejan en el callback onError, pero este bloque atrapa fallas de persistencia
      console.error('Error durante el inicio de sesión:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      {/* Botón de Retorno Flotante (Para volver al catálogo público) */}
      <TouchableOpacity
        onPress={() => router.replace('/(tabs)')}
        className="absolute top-12 left-4 z-10 w-10 h-10 rounded-full bg-white justify-center items-center border border-slate-100 shadow-sm active:bg-slate-50"
      >
        <ChevronLeft size={24} color="#1e3a8a" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          {/* Contenedor del Formulario (Tarjeta Blanca Premium) */}
          <View className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-md">
            
            {/* Cabecera del Formulario */}
            <View className="items-center mb-8">
              <View className="p-3 bg-blue-50 rounded-2xl mb-4">
                <Mail size={32} color="#2563eb" />
              </View>
              <Text className="text-2xl font-black text-slate-900 tracking-tight">
                Iniciar Sesión
              </Text>
              <Text className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider text-center">
                Acceso Interno a EstateCore ERP
              </Text>
            </View>

            {/* Banner de Mensaje de Error */}
            {errorLocal && (
              <View className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl mb-5 flex-row items-center">
                <ShieldAlert size={18} color="#f43f5e" />
                <Text className="text-rose-600 text-xs font-semibold ml-2 flex-1">
                  {errorLocal}
                </Text>
              </View>
            )}

            {/* Inputs del Formulario */}
            <View className="space-y-4">
              
              {/* Campo: Correo Electrónico */}
              <View>
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Correo Electrónico
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                  <Mail size={18} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-2.5 text-slate-800 text-sm font-semibold outline-none"
                    placeholder="ejemplo@correo.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={correo}
                    onChangeText={setCorreo}
                  />
                </View>
              </View>

              {/* Campo: Contraseña */}
              <View className="mt-4">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Contraseña
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3">
                  <Lock size={18} color="#94a3b8" />
                  <TextInput
                    className="flex-1 ml-2.5 text-slate-800 text-sm font-semibold outline-none"
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={contrasenia}
                    onChangeText={setContrasenia}
                  />
                </View>
              </View>

            </View>

            {/* Botón de Submit */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-corporate-600 py-3.5 rounded-xl mt-8 flex-row justify-center items-center active:bg-corporate-700 shadow-sm"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-sm font-bold tracking-wider uppercase">
                  Acceder al Sistema
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
