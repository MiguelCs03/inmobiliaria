import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { ArrowLeft, Calendar, User, Home, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/context/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MAP_TIPO_PROPIEDAD, MAP_TIPO_OPERACION } from '@/constants/properties';
import { CREATE_VISITA } from '@/graphql/mutations';

// Query de GraphQL para obtener las propiedades
const QUERY_PROPIEDADES = gql`
  query GetPropiedades {
    propiedades {
      success
      data {
        id
        precioBase
        tipoPropiedadId
        tipoOperacionId
        ubicacion
      }
    }
  }
`;

// Query de GraphQL para obtener los empleados (Agentes)
const QUERY_EMPLEADOS = gql`
  query GetEmpleados {
    empleados {
      success
      data {
        id
        nombres
        apellidos
      }
    }
  }
`;

// Query de GraphQL para obtener todos los clientes y buscar al dueño del login
const QUERY_CLIENTES = gql`
  query GetClientes {
    clientes {
      success
      data {
        id
        nombres
        usuarioId
      }
    }
  }
`;

export default function ReservarScreen() {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const searchParams = useLocalSearchParams();

  // Estados del formulario
  const [propiedadId, setPropiedadId] = useState<number | null>(null);
  const [empleadoId, setEmpleadoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(''); // Formato: YYYY-MM-DD
  const [hora, setHora] = useState('');   // Formato: HH:MM
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [visitaCreadaId, setVisitaCreadaId] = useState<number | null>(null);

  // Queries de GraphQL
  const { data: dataProp, loading: loadProp, error: errorProp } = useQuery<any>(QUERY_PROPIEDADES);
  const { data: dataEmp, loading: loadEmp, error: errorEmp } = useQuery<any>(QUERY_EMPLEADOS);
  const { data: dataCli, loading: loadCli, error: errorCli } = useQuery<any>(QUERY_CLIENTES, {
    skip: !usuario
  });

  // Mutation para crear la visita
  const [crearVisita, { loading: cargandoCrear }] = useMutation<any, any>(CREATE_VISITA, {
    onError: (err) => {
      setErrorLocal(err.message || 'Error al guardar la reserva en el servidor.');
    }
  });

  // Listas procesadas
  const propiedades = useMemo(() => dataProp?.propiedades?.data || [], [dataProp]);
  const empleados = useMemo(() => dataEmp?.empleados?.data || [], [dataEmp]);
  const clientes = useMemo(() => dataCli?.clientes?.data || [], [dataCli]);

  // Pre-seleccionar propiedad si viene por parámetros de ruta
  useEffect(() => {
    if (searchParams.propiedadId && propiedades.length > 0) {
      setPropiedadId(Number(searchParams.propiedadId));
    }
  }, [searchParams.propiedadId, propiedades]);

  // Resolver el ID del cliente logueado
  const clienteIdResolver = useMemo(() => {
    if (!usuario) return null;
    // Buscar si el usuario logueado tiene un registro de cliente asociado
    const clienteMatch = clientes.find((c: any) => c.usuarioId === usuario.id);
    if (clienteMatch) return clienteMatch.id;
    
    // Si no tiene registro (por ejemplo es un administrador), default al primer cliente de la base de datos
    if (clientes.length > 0) return clientes[0].id;
    return null;
  }, [usuario, clientes]);

  const loadingGlobal = loadProp || loadEmp || (usuario && loadCli);

  // Manejador del Submit
  const handleReservar = async () => {
    setErrorLocal(null);

    if (!usuario) {
      setErrorLocal('Debes iniciar sesión para realizar una reserva.');
      return;
    }

    if (!propiedadId) {
      setErrorLocal('Por favor, selecciona un inmueble.');
      return;
    }

    if (!empleadoId) {
      setErrorLocal('Por favor, selecciona un agente de la lista.');
      return;
    }

    if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      setErrorLocal('Formato de fecha inválido. Usa el formato AAAA-MM-DD (Ej: 2026-06-15).');
      return;
    }

    if (!hora.match(/^\d{2}:\d{2}$/)) {
      setErrorLocal('Formato de hora inválido. Usa el formato HH:MM (Ej: 15:30).');
      return;
    }

    const clienteId = clienteIdResolver;
    if (!clienteId) {
      setErrorLocal('No se pudo determinar el ID de cliente. Contacte al administrador.');
      return;
    }

    // Combinar fecha y hora para generar un string ISO 8601 válido para NestJS DateTime scalar
    const fechaVisitaIso = `${fecha}T${hora}:00.000Z`;

    try {
      const response = await crearVisita({
        variables: {
          input: {
            clienteId,
            empleadoId,
            propiedadId,
            fechaVisita: fechaVisitaIso,
            estado: 'Pendiente'
          }
        }
      });

      const resultado = response.data?.createVisita;
      if (resultado && resultado.success && resultado.data) {
        setVisitaCreadaId(resultado.data.id);
        setExito(true);
      } else {
        setErrorLocal(resultado?.message || 'No se pudo agendar la cita.');
      }
    } catch (e) {
      console.error('Error al realizar reserva:', e);
    }
  };

  // 1. RENDER: No está autenticado
  if (!usuario) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100" style={{ paddingTop: insets.top }}>
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={22} color="#334155" />
          </TouchableOpacity>
          <Text className="text-slate-900 font-extrabold text-base ml-2">Reservar Cita</Text>
        </View>
        <View className="flex-1 justify-center items-center px-6">
          <ShieldAlert size={56} color="#ef4444" />
          <Text className="text-slate-900 text-lg font-bold mt-4 text-center">Acceso Restringido</Text>
          <Text className="text-slate-500 text-sm text-center mt-2 mb-6 leading-relaxed">
            Debes iniciar sesión con tu cuenta de cliente para poder agendar y pagar citas de visitas de inmuebles.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/login')}
            className="bg-corporate-600 px-6 py-3.5 rounded-xl shadow-sm active:bg-corporate-700 w-full flex-row justify-center items-center"
          >
            <Text className="text-white font-bold text-sm mr-2">INICIAR SESIÓN</Text>
            <ArrowRight size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 2. RENDER: Éxito (Reserva creada con éxito)
  if (exito) {
    // Buscar datos de la propiedad seleccionada para mostrar en el resumen de pago
    const propSeleccionada = propiedades.find((p: any) => p.id === propiedadId);
    const tipoNombre = propSeleccionada ? MAP_TIPO_PROPIEDAD[propSeleccionada.tipoPropiedadId] : 'Inmueble';
    const ubicacionNombre = propSeleccionada?.ubicacion?.startsWith('{')
      ? JSON.parse(propSeleccionada.ubicacion).direccion
      : propSeleccionada?.ubicacion || 'Zona Residencial';

    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center px-6" style={{ paddingTop: insets.top }}>
        <CheckCircle2 size={64} color="#10b981" />
        <Text className="text-slate-900 text-2xl font-black mt-4 text-center">¡Cita Pre-Reservada!</Text>
        <Text className="text-slate-500 text-sm text-center mt-2 mb-8 leading-relaxed">
          Tu visita ha sido registrada con éxito en el sistema de NestJS con estado <Text className="font-bold text-slate-800">Pendiente de Pago</Text>.
        </Text>

        {/* Resumen de la reserva */}
        <View className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm w-full mb-8">
          <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3">Resumen de Reserva</Text>
          <Text className="text-slate-800 font-bold text-sm mb-1">{tipoNombre.toUpperCase()} - ID #{propiedadId}</Text>
          <Text className="text-slate-500 text-xs mb-3">{ubicacionNombre}</Text>
          
          <View className="h-[1px] bg-slate-100 my-2" />
          
          <Text className="text-slate-800 font-bold text-sm mb-1">Fecha y Hora Programadas</Text>
          <Text className="text-slate-500 text-xs mb-3">{fecha} a las {hora} Hrs</Text>
          
          <View className="h-[1px] bg-slate-100 my-2" />
          
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-slate-900 font-bold text-sm">Costo de la Reserva</Text>
            <Text className="text-corporate-600 font-black text-lg">$50.00 USD</Text>
          </View>
        </View>

        {/* Botón para proceder al pago estático */}
        <TouchableOpacity
          onPress={() => router.replace({
            pathname: '/pago' as any,
            params: {
              visitaId: visitaCreadaId?.toString(),
              propiedadId: propiedadId?.toString(),
              tipo: tipoNombre,
              direccion: ubicacionNombre,
              fecha: fecha,
              hora: hora
            }
          })}
          className="bg-corporate-600 py-4 rounded-xl shadow-sm active:bg-corporate-700 w-full flex-row justify-center items-center"
        >
          <Text className="text-white text-sm font-bold mr-2">PAGAR RESERVA</Text>
          <ArrowRight size={16} color="#ffffff" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#334155" />
        </TouchableOpacity>
        <Text className="text-slate-900 font-extrabold text-base ml-2">Reservar Cita</Text>
      </View>

      {loadingGlobal ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-500 text-sm mt-3 font-semibold">Cargando datos del catálogo...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Tarjeta de Formulario */}
          <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-5">
            <Text className="text-slate-900 text-lg font-black mb-6">Agenda tu Visita</Text>

            {(errorLocal || errorProp || errorEmp || errorCli) && (
              <View className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl mb-5 flex-row items-center">
                <ShieldAlert size={18} color="#f43f5e" />
                <Text className="text-rose-600 text-xs font-semibold ml-2 flex-1">
                  {errorLocal || errorProp?.message || errorEmp?.message || errorCli?.message}
                </Text>
              </View>
            )}

            {/* Campo 1: Selección de Inmueble */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Home size={14} color="#64748b" className="mr-1.5" />
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Seleccionar Inmueble</Text>
              </View>
              <View className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                  {propiedades.map((p: any) => {
                    const tipo = MAP_TIPO_PROPIEDAD[p.tipoPropiedadId] || 'casa';
                    const operacion = MAP_TIPO_OPERACION[p.tipoOperacionId] || 'venta';
                    const dir = p.ubicacion?.startsWith('{')
                      ? JSON.parse(p.ubicacion).direccion
                      : p.ubicacion || 'Zona Residencial';
                    const seleccionado = propiedadId === p.id;

                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setPropiedadId(p.id)}
                        className={`p-3 border-b border-slate-100 flex-row justify-between items-center ${seleccionado ? 'bg-blue-50/50' : ''}`}
                      >
                        <View className="flex-1 pr-2">
                          <Text className={`text-xs font-bold ${seleccionado ? 'text-blue-700' : 'text-slate-700'}`}>
                            {tipo.toUpperCase()} en {dir.split(',')[0]}
                          </Text>
                          <Text className="text-[10px] text-slate-400 capitalize">{operacion} - ID #{p.id}</Text>
                        </View>
                        {seleccionado && <CheckCircle2 size={14} color="#2563eb" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Campo 2: Selección de Agente / Empleado */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <User size={14} color="#64748b" className="mr-1.5" />
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Seleccionar Agente Asignado</Text>
              </View>
              <View className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
                  {empleados.map((e: any) => {
                    const seleccionado = empleadoId === e.id;
                    return (
                      <TouchableOpacity
                        key={e.id}
                        onPress={() => setEmpleadoId(e.id)}
                        className={`p-3 border-b border-slate-100 flex-row justify-between items-center ${seleccionado ? 'bg-blue-50/50' : ''}`}
                      >
                        <Text className={`text-xs font-bold ${seleccionado ? 'text-blue-700' : 'text-slate-700'}`}>
                          {e.nombres} {e.apellidos}
                        </Text>
                        {seleccionado && <CheckCircle2 size={14} color="#2563eb" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>

            {/* Campo 3: Fecha (Texto) */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Calendar size={14} color="#64748b" className="mr-1.5" />
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Fecha de la Visita</Text>
              </View>
              <TextInput
                value={fecha}
                onChangeText={setFecha}
                placeholder="AAAA-MM-DD (Ej: 2026-06-15)"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 text-xs font-semibold"
                keyboardType="numeric"
              />
            </View>

            {/* Campo 4: Hora (Texto) */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Calendar size={14} color="#64748b" className="mr-1.5" />
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Hora de la Visita</Text>
              </View>
              <TextInput
                value={hora}
                onChangeText={setHora}
                placeholder="HH:MM (Ej: 15:30)"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 text-xs font-semibold"
                keyboardType="numeric"
              />
            </View>

            {/* Botón de Submit */}
            <TouchableOpacity
              onPress={handleReservar}
              disabled={cargandoCrear}
              className="bg-corporate-600 py-4 rounded-xl flex-row justify-center items-center active:bg-corporate-700 shadow-sm"
            >
              {cargandoCrear ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white text-sm font-bold mr-2">AGENDAR CITA</Text>
                  <ArrowRight size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
