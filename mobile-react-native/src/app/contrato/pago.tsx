import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  StatusBar,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Lock,
  BadgeDollarSign
} from 'lucide-react-native';
import { PAGAR_CUOTA, CREAR_STRIPE_PAYMENT_INTENT } from '@/graphql/mutations';
import { usePlatformStripe } from '@/hooks/useStripeHook';

export default function ContratoPagoScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Obtener parámetros con fallbacks robustos
  const parseParam = (val: string | string[] | undefined): string => {
    if (!val) return '';
    return typeof val === 'string' ? val : val[0] || '';
  };

  const planPagoId = parseInt(parseParam(params.planPagoId)) || 0;
  const contratoId = parseParam(params.contratoId) || 'N/A';
  const contratoTitulo = parseParam(params.contratoTitulo) || 'Contrato Inmobiliario';
  const monto = parseFloat(parseParam(params.monto)) || 0.0;
  const nroCuota = parseParam(params.nroCuota) || '1';

  // Estados
  const [metodo, setMetodo] = useState<'tarjeta' | 'qr'>('tarjeta');
  const [nitCliente, setNitCliente] = useState(parseParam(params.nitCliente));
  const [razonSocial, setRazonSocial] = useState(parseParam(params.razonSocial));
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [mostrarExito, setMostrarExito] = useState(false);
  const [procesandoInterno, setProcesandoInterno] = useState(false);
  const [facturaCreada, setFacturaCreada] = useState<any>(null);

  // Campos Tarjeta (para Web/Simulación)
  const [nroTarjeta, setNroTarjeta] = useState('');
  const [nombreTitular, setNombreTitular] = useState(parseParam(params.razonSocial) || '');
  const [fechaExp, setFechaExp] = useState('');
  const [cvv, setCvv] = useState('');

  // Hook personalizado de Stripe (maneja nativo y fallback de web)
  const { isWeb, initPaymentSheet, presentPaymentSheet } = usePlatformStripe();

  // Mutation para crear el Payment Intent en Stripe
  const [crearPaymentIntent, { loading: creandoIntent }] = useMutation<any, any>(CREAR_STRIPE_PAYMENT_INTENT);

  // Mutation para registrar el pago de la cuota en NestJS y generar factura SIAT
  const [pagarCuota, { loading: procesandoPago }] = useMutation<any, any>(PAGAR_CUOTA, {
    onError: (err) => {
      console.warn('Error al registrar pago de cuota en GraphQL:', err);
      setErrorLocal(err.message || 'Error al procesar el pago y facturación.');
    }
  });

  const cargandoPago = procesandoPago || creandoIntent || procesandoInterno;

  const handleConfirmarPago = async () => {
    setErrorLocal(null);

    // Validar campos de facturación SIAT
    if (!nitCliente.trim()) {
      setErrorLocal('El NIT/CI es requerido para la factura SIAT.');
      return;
    }
    if (!razonSocial.trim()) {
      setErrorLocal('La Razón Social es requerida para la factura SIAT.');
      return;
    }

    // Validaciones Locales para Tarjeta en Web
    if (metodo === 'tarjeta' && isWeb) {
      const cleanCard = nroTarjeta.replace(/\s/g, '');
      if (cleanCard.length < 16 || !/^\d+$/.test(cleanCard)) {
        setErrorLocal('Por favor, ingresa un número de tarjeta válido de 16 dígitos.');
        return;
      }
      if (!nombreTitular.trim()) {
        setErrorLocal('Por favor, ingresa el nombre del titular.');
        return;
      }
      if (!fechaExp.match(/^\d{2}\/\d{2}$/)) {
        setErrorLocal('Formato de vencimiento inválido. Usa MM/AA (Ej: 12/28).');
        return;
      }
      if (cvv.length < 3 || !/^\d+$/.test(cvv)) {
        setErrorLocal('Por favor, ingresa un código CVV válido de 3 o 4 dígitos.');
        return;
      }
    }

    if (metodo === 'tarjeta') {
      setProcesandoInterno(true);
      try {
        // 1. Crear el Payment Intent en el backend (NestJS)
        const response = await crearPaymentIntent({
          variables: {
            monto: monto
          }
        });

        const data = response.data?.crearStripePaymentIntent;
        if (!data || !data.success) {
          throw new Error(data?.message || 'No se pudo iniciar el proceso de pago con Stripe.');
        }

        const clientSecret = data.clientSecret;
        if (!clientSecret) {
          throw new Error('No se recibió el clientSecret de la pasarela de pagos.');
        }

        if (isWeb) {
          // 2a. Flujo de Simulación en Web
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const res = await pagarCuota({
            variables: {
              input: {
                planPagoId,
                nitCliente: nitCliente.trim(),
                razonSocial: razonSocial.trim(),
                metodoPago: 'STRIPE_CARD'
              }
            }
          });

          if (res.data?.pagarCuota?.success) {
            setFacturaCreada(res.data.pagarCuota.data);
            setMostrarExito(true);
          } else {
            setErrorLocal(res.data?.pagarCuota?.message || 'Error al facturar la cuota.');
          }
        } else {
          // 2b. Flujo Real de Stripe en Móvil Nativo
          const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: 'Inmobiliaria EstateCore',
            defaultBillingDetails: {
              name: nombreTitular || razonSocial,
            },
          });

          if (initError) {
            throw new Error(`Error al inicializar pasarela: ${initError.message}`);
          }

          const { error: paymentError } = await presentPaymentSheet();

          if (paymentError) {
            if (paymentError.code === 'Canceled') {
              setErrorLocal('Pago cancelado por el usuario.');
              return;
            }
            throw new Error(`Error en el pago: ${paymentError.message}`);
          }

          // Pago exitoso en Stripe native -> registrar en base de datos y generar factura
          const res = await pagarCuota({
            variables: {
              input: {
                planPagoId,
                nitCliente: nitCliente.trim(),
                razonSocial: razonSocial.trim(),
                metodoPago: 'STRIPE_CARD'
              }
            }
          });

          if (res.data?.pagarCuota?.success) {
            setFacturaCreada(res.data.pagarCuota.data);
            setMostrarExito(true);
          } else {
            setErrorLocal(res.data?.pagarCuota?.message || 'Pago completado en Stripe pero falló el registro de factura en base de datos.');
          }
        }
      } catch (err: any) {
        console.error('Error durante el pago con Stripe:', err);
        setErrorLocal(err.message || 'Ocurrió un error inesperado al procesar el pago.');
      } finally {
        setProcesandoInterno(false);
      }
    } else {
      // Flujo de pago QR (Simulado)
      setProcesandoInterno(true);
      try {
        const res = await pagarCuota({
          variables: {
            input: {
              planPagoId,
              nitCliente: nitCliente.trim(),
              razonSocial: razonSocial.trim(),
              metodoPago: 'SIMPLE_QR'
            }
          }
        });

        if (res.data?.pagarCuota?.success) {
          setFacturaCreada(res.data.pagarCuota.data);
          setMostrarExito(true);
        } else {
          setErrorLocal(res.data?.pagarCuota?.message || 'Error al procesar el pago QR.');
        }
      } catch (e: any) {
        console.error('Error en pago QR:', e);
        setErrorLocal(e.message || 'Error al procesar el pago QR.');
      } finally {
        setProcesandoInterno(false);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />

      {/* CABECERA */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={22} color="#334155" />
        </TouchableOpacity>
        <Text className="text-slate-900 font-extrabold text-base ml-2">Pagar Cuota</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* DETALLES DEL CONTRATO */}
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Plan de Pagos</Text>
              <View className="bg-blue-50 px-2 py-0.5 rounded-md">
                <Text className="text-blue-600 text-[10px] font-bold">Cuota #{nroCuota}</Text>
              </View>
            </View>

            <Text className="text-slate-800 font-bold text-sm mb-1">{contratoTitulo}</Text>
            <Text className="text-slate-500 text-xs mb-3">Contrato ID: #{contratoId}</Text>

            <View className="h-[1px] bg-slate-100 my-2" />

            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row items-center">
                <BadgeDollarSign size={18} color="#2563eb" className="mr-1" />
                <Text className="text-slate-900 font-bold text-sm">Monto de la Cuota</Text>
              </View>
              <Text className="text-corporate-800 font-black text-xl">${monto.toFixed(2)} USD</Text>
            </View>
          </View>

          {/* DATOS DE FACTURACIÓN SIAT */}
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">Datos de Facturación (SIAT)</Text>
          <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5 gap-y-4">
            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">NIT o CI del Cliente</Text>
              <TextInput
                value={nitCliente}
                onChangeText={setNitCliente}
                placeholder="Ej. 1234567"
                keyboardType="numeric"
                className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
              />
            </View>

            <View>
              <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Razón Social</Text>
              <TextInput
                value={razonSocial}
                onChangeText={setRazonSocial}
                placeholder="Ej. Juan Pérez"
                autoCapitalize="words"
                className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
              />
            </View>
          </View>

          {/* MÉTODOS DE PAGO */}
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">Método de Pago</Text>
          <View className="flex-row space-x-2 mb-5">
            {/* Tarjeta */}
            <TouchableOpacity
              onPress={() => { setMetodo('tarjeta'); setErrorLocal(null); }}
              className={`flex-1 p-3.5 rounded-2xl border items-center flex-row justify-center ${
                metodo === 'tarjeta' 
                  ? 'bg-blue-50/75 border-corporate-500' 
                  : 'bg-white border-slate-100'
              }`}
            >
              <CreditCard size={18} color={metodo === 'tarjeta' ? '#2563eb' : '#64748b'} />
              <Text className={`text-xs font-bold ml-1.5 ${metodo === 'tarjeta' ? 'text-blue-700' : 'text-slate-500'}`}>
                Tarjeta
              </Text>
            </TouchableOpacity>

            {/* QR */}
            <TouchableOpacity
              onPress={() => { setMetodo('qr'); setErrorLocal(null); }}
              className={`flex-1 p-3.5 rounded-2xl border items-center flex-row justify-center ${
                metodo === 'qr' 
                  ? 'bg-blue-50/75 border-corporate-500' 
                  : 'bg-white border-slate-100'
              }`}
            >
              <QrCode size={18} color={metodo === 'qr' ? '#2563eb' : '#64748b'} />
              <Text className={`text-xs font-bold ml-1.5 ${metodo === 'qr' ? 'text-blue-700' : 'text-slate-500'}`}>
                Pago QR
              </Text>
            </TouchableOpacity>
          </View>

          {/* MENSAJES DE ERROR */}
          {errorLocal && (
            <View className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl mb-5 flex-row items-center">
              <AlertCircle size={18} color="#f43f5e" />
              <Text className="text-rose-600 text-xs font-semibold ml-2 flex-1">{errorLocal}</Text>
            </View>
          )}

          {/* FORMULARIOS POR MÉTODO */}
          <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm mb-6">
            {metodo === 'tarjeta' && (
              <View className="space-y-4">
                <Text className="text-slate-900 font-extrabold text-sm mb-3">Tarjeta de Crédito / Débito</Text>
                
                {isWeb ? (
                  <>
                    <View>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Número de Tarjeta</Text>
                      <TextInput
                        value={nroTarjeta}
                        onChangeText={(text) => {
                          const clean = text.replace(/\D/g, '').slice(0, 16);
                          const parts = clean.match(/.{1,4}/g);
                          setNroTarjeta(parts ? parts.join(' ') : clean);
                        }}
                        placeholder="4000 1234 5678 9010"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
                      />
                    </View>

                    <View>
                      <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Nombre del Titular</Text>
                      <TextInput
                        value={nombreTitular}
                        onChangeText={setNombreTitular}
                        placeholder="TITULAR DE LA TARJETA"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="characters"
                        className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
                      />
                    </View>

                    <View className="flex-row space-x-3">
                      <View className="flex-1">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Vencimiento</Text>
                        <TextInput
                          value={fechaExp}
                          onChangeText={(text) => {
                            const clean = text.replace(/\D/g, '').slice(0, 4);
                            if (clean.length >= 2) {
                              setFechaExp(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
                            } else {
                              setFechaExp(clean);
                            }
                          }}
                          placeholder="MM/AA"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1.5">Código CVV</Text>
                        <TextInput
                          value={cvv}
                          onChangeText={(text) => setCvv(text.replace(/\D/g, '').slice(0, 4))}
                          placeholder="123"
                          placeholderTextColor="#94a3b8"
                          keyboardType="numeric"
                          secureTextEntry
                          className="bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold"
                        />
                      </View>
                    </View>
                  </>
                ) : (
                  <View className="bg-slate-50 p-6 rounded-2xl border border-slate-100 items-center justify-center py-6">
                    <ShieldCheck size={36} color="#2563eb" className="mb-2" />
                    <Text className="text-slate-800 font-extrabold text-xs text-center mb-1">Pago seguro con Stripe</Text>
                    <Text className="text-slate-400 text-[10px] text-center px-4 leading-relaxed">
                      Al presionar el botón de abajo, se abrirá de manera segura la ventana de pago integrada de Stripe en tu dispositivo.
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center mt-3 pt-2">
                  <ShieldCheck size={14} color="#10b981" />
                  <Text className="text-slate-400 text-[10px] ml-1">Transacción protegida con cifrado SSL de 256 bits.</Text>
                </View>
              </View>
            )}

            {metodo === 'qr' && (
              <View className="items-center py-2">
                <Text className="text-slate-900 font-extrabold text-sm mb-2">Pago Simple QR</Text>
                <Text className="text-slate-400 text-[10px] text-center mb-5 px-3 leading-relaxed">
                  Generamos un código QR único para tu cuota. Escanéalo desde tu aplicación móvil bancaria para pagar e informar el depósito al instante.
                </Text>

                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 items-center justify-center">
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=cuota-pago-planPagoId-${planPagoId}-monto-${monto}` }}
                    style={{ width: 170, height: 170 }}
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-slate-500 font-bold text-[10px] uppercase bg-slate-100 px-3 py-1 rounded-full">
                  Monto: ${monto.toFixed(2)} USD
                </Text>
              </View>
            )}
          </View>

          {/* BOTÓN DE PAGAR */}
          <TouchableOpacity
            onPress={handleConfirmarPago}
            disabled={cargandoPago}
            className="bg-corporate-600 py-4 rounded-xl flex-row justify-center items-center active:bg-corporate-700 shadow-sm"
          >
            {cargandoPago ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Lock size={15} color="#ffffff" className="mr-1.5" />
                <Text className="text-white text-sm font-bold">
                  {metodo === 'tarjeta' && !isWeb ? 'ABRIR PASARELA STRIPE' : `CONFIRMAR Y PAGAR $${monto.toFixed(2)} USD`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL DE ÉXITO */}
      <Modal
        visible={mostrarExito}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-slate-900/60 px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl border border-slate-50">
            <CheckCircle2 size={56} color="#10b981" />
            
            <Text className="text-slate-900 text-xl font-black mt-4 text-center">¡Pago Procesado!</Text>
            <Text className="text-slate-500 text-xs text-center mt-2 mb-6 leading-relaxed">
              La cuota de tu contrato ha sido pagada correctamente y se ha validado la Facturación Electrónica en el SIAT.
            </Text>

            {facturaCreada && (
              <View className="bg-slate-50 rounded-xl p-4 w-full border border-slate-100 mb-6">
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-slate-400 text-[10px] font-bold">FACTURA NRO</Text>
                  <Text className="text-slate-700 text-[10px] font-bold">#{facturaCreada.nroFactura}</Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-slate-400 text-[10px] font-bold">CUF</Text>
                  <Text numberOfLines={1} className="text-slate-700 text-[10px] font-mono font-bold max-w-[150px]">
                    {facturaCreada.cuf}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-slate-400 text-[10px] font-bold">NIT CLIENTE</Text>
                  <Text className="text-slate-700 text-[10px] font-bold">{facturaCreada.nitCliente}</Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-slate-400 text-[10px] font-bold">MONTO TOTAL</Text>
                  <Text className="text-slate-700 text-[10px] font-bold">${monto.toFixed(2)} USD</Text>
                </View>
                <View className="flex-row justify-between items-center py-1">
                  <Text className="text-slate-400 text-[10px] font-bold">ESTADO SIAT</Text>
                  <Text className="text-emerald-600 text-[10px] font-bold uppercase">{facturaCreada.estadoSiat || 'VALIDA'}</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => {
                setMostrarExito(false);
                router.replace({
                  pathname: '/contrato/[id]',
                  params: { id: contratoId },
                });
              }}
              className="bg-corporate-600 py-3 px-6 rounded-xl w-full active:bg-corporate-700 shadow-sm"
            >
              <Text className="text-white text-center font-bold text-xs">VOLVER AL CONTRATO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
