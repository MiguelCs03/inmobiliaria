import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import messaging from '@react-native-firebase/messaging';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { useAuth } from '@/context/auth-context';

// Mutacion de GraphQL para registrar el token FCM en el API Gateway y base de datos
const MUTATION_VINCULAR_DISPOSITIVO = gql`
  mutation RegistrarDispositivo($usuarioId: Int, $tokenFcm: String!, $plataforma: String!) {
    registrarDispositivo(
      registrarDispositivoInput: {
        usuarioId: $usuarioId
        tokenFcm: $tokenFcm
        plataforma: $plataforma
      }
    ) {
      success
      message
    }
  }
`;

export function useNotifications() {
  const { usuario } = useAuth();
  const [tokenFcm, setTokenFcm] = useState<string | null>(null);
  const [permisoConcedido, setPermisoConcedido] = useState(false);
  const [ultimoMensaje, setUltimoMensaje] = useState<Notifications.Notification | null>(null);

  // Ref para evitar envios duplicados del token FCM al backend en una misma sesion
  const tokenRegistradoRef = useRef<string | null>(null);

  // Hook de Apollo para registrar el token FCM en el servidor
  const [vincularToken] = useMutation<any, any>(MUTATION_VINCULAR_DISPOSITIVO, {
    onCompleted: (data: any) => {
      console.log('[useNotifications - Apollo onCompleted] Vinculación exitosa:', data?.registrarDispositivo?.message);
      console.log('[useNotifications - Apollo onCompleted] Success flag:', data?.registrarDispositivo?.success);
    },
    onError: (error: any) => {
      console.error('[useNotifications - Apollo onError] Error al vincular token FCM:', error.message);
      if (error.graphQLErrors) {
        console.error('[useNotifications - Apollo onError] GraphQL Errors:', error.graphQLErrors);
      }
      if (error.networkError) {
        console.error('[useNotifications - Apollo onError] Network Error:', error.networkError);
      }
    },
  });

  // Log de estado interno cada vez que cambien usuario o tokenFcm
  useEffect(() => {
    console.log('[useNotifications - Estado Actual] tokenFcm:', tokenFcm ? `${tokenFcm.substring(0, 15)}...` : 'null', 'usuarioId:', usuario?.id || 'No logueado');
  }, [usuario, tokenFcm]);

  // Configuracion de notificaciones en primer plano y canales de Android
  useEffect(() => {
    console.log('[useNotifications] Configurando manejadores de notificaciones y canal de Android...');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    const configurarCanalAndroid = async () => {
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('canal-inmobiliaria', {
            name: 'Alertas Inmobiliarias',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#208AEF',
            enableLights: true,
            enableVibrate: true,
            showBadge: true,
          });
          console.log('[useNotifications] Canal de Android configurado correctamente');
        } catch (err) {
          console.error('[useNotifications] Error al configurar canal de Android:', err);
        }
      }
    };

    configurarCanalAndroid();
  }, []);

  // Flujo A: Registro de permisos nativos, obtencion de Token y suscripcion anonima
  useEffect(() => {
    const inicializarPushNotifications = async () => {
      try {
        console.log('[useNotifications] Iniciando inicializarPushNotifications...');
        console.log('[useNotifications] Hardware - ¿Es dispositivo físico?:', Device.isDevice);
        
        if (!Device.isDevice) {
          console.warn('[useNotifications] Cuidado: No es dispositivo físico. Las notificaciones push podrían fallar en iOS, pero en emulador Android con Google Play Services podría funcionar.');
        }

        // Verificar permisos actuales
        const estadoExistenteRes = await Notifications.getPermissionsAsync() as any;
        const estadoExistente = estadoExistenteRes.status;
        console.log('[useNotifications] Permiso existente:', estadoExistente);
        let estadoFinal = estadoExistente;

        // Si no se han solicitado permisos, se solicitan de forma nativa
        if (estadoExistente !== 'granted') {
          console.log('[useNotifications] Solicitando permisos nativos...');
          const nuevoEstadoRes = await Notifications.requestPermissionsAsync() as any;
          estadoFinal = nuevoEstadoRes.status;
          console.log('[useNotifications] Nuevo estado de permiso concedido:', estadoFinal);
        }

        if (estadoFinal !== 'granted') {
          console.warn('[useNotifications] Permisos de notificación DENEGADOS.');
          setPermisoConcedido(false);
          return;
        }

        setPermisoConcedido(true);
        console.log('[useNotifications] Permisos de notificación CONCEDIDOS.');

        // Obtener el token FCM nativo del dispositivo
        let fcmTokenStr = '';
        try {
          if (Platform.OS === 'android') {
            console.log('[useNotifications] Obteniendo token FCM de Firebase en Android...');
            fcmTokenStr = await messaging().getToken();
          } else {
            console.log('[useNotifications] Registrando dispositivo para control remoto en iOS...');
            await messaging().registerDeviceForRemoteMessages();
            console.log('[useNotifications] Obteniendo token FCM de Firebase en iOS...');
            fcmTokenStr = await messaging().getToken();
          }
          console.log('[useNotifications] Token FCM obtenido exitosamente:', fcmTokenStr);
        } catch (tokenError: any) {
          console.error('[useNotifications] Error crítico al obtener token FCM de Firebase:', tokenError);
        }

        if (fcmTokenStr) {
          setTokenFcm(fcmTokenStr);

          // FLUJO A: Suscripcion automatica a temas globales para clientes sin login
          try {
            console.log('[useNotifications] Suscribiendo a tema: nuevas-propiedades...');
            await messaging().subscribeToTopic('nuevas-propiedades');
            console.log('[useNotifications] Suscripción exitosa a tema: nuevas-propiedades');
          } catch (topicError) {
            console.error('[useNotifications] Falló la suscripción al tema de Firebase:', topicError);
          }
        } else {
          console.error('[useNotifications] No se pudo obtener el token de Firebase (retornó vacío).');
        }
      } catch (error) {
        console.error('[useNotifications] Error en inicializarPushNotifications:', error);
      }
    };

    inicializarPushNotifications();
  }, []);

  // Flujo B: Vinculacion automatica del dispositivo (soporta registro anonimo y logueado)
  useEffect(() => {
    console.log('[useNotifications] Evaluando registro en Backend. tokenFcm:', tokenFcm ? `${tokenFcm.substring(0, 15)}...` : 'null');
    if (!tokenFcm) {
      console.log('[useNotifications] Cancelando registro: tokenFcm no está disponible aún.');
      return;
    }

    const usuarioId = usuario?.id || null;
    const cacheKey = `${tokenFcm}_${usuarioId}`;
    console.log('[useNotifications] cacheKey para backend:', cacheKey, 'tokenRegistradoRef actual:', tokenRegistradoRef.current);

    if (tokenRegistradoRef.current !== cacheKey) {
      const registrarTokenEnBackend = async () => {
        try {
          console.log('[useNotifications] Ejecutando mutación vincularToken con variables:', {
            usuarioId,
            tokenFcm,
            plataforma: Platform.OS
          });
          const result = await vincularToken({
            variables: {
              usuarioId: usuarioId,
              tokenFcm: tokenFcm,
              plataforma: Platform.OS,
            },
          });
          console.log('[useNotifications] Mutación enviada. Resultado devuelto:', result);
          tokenRegistradoRef.current = cacheKey;
        } catch (err: any) {
          console.error('[useNotifications] Excepción atrapada al enviar mutación al backend:', err);
          console.error('[useNotifications] Detalles error:', JSON.stringify(err));
        }
      };

      registrarTokenEnBackend();
    } else {
      console.log('[useNotifications] Omitiendo registro en backend: Ya está registrado para este token y usuario en esta ejecución.');
    }
  }, [usuario, tokenFcm, vincularToken]);

  // Manejo de listeners para recibir y presionar notificaciones
  useEffect(() => {
    console.log('[useNotifications] Configurando listeners de eventos de notificaciones...');
    
    // Escucha de notificaciones recibidas en primer plano (Foreground)
    const listenerRecibido = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[useNotifications] Evento Recibido en Primer Plano:', notification);
      setUltimoMensaje(notification);
    });

    // Escucha de interaccion del usuario con la notificacion (Click)
    const listenerRespuesta = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[useNotifications] Evento Click/Interacción de Notificación:', response);
      const datosExtra = response.notification.request.content.data;
      if (datosExtra && typeof datosExtra === 'object' && 'ruta' in datosExtra) {
        console.log('[useNotifications] Redirigiendo a ruta en payload:', datosExtra.ruta);
      }
    });

    // Limpieza de listeners nativos al desmontar el hook
    return () => {
      console.log('[useNotifications] Removiendo listeners de eventos de notificaciones...');
      listenerRecibido.remove();
      listenerRespuesta.remove();
    };
  }, []);

  return {
    tokenFcm,
    permisoConcedido,
    ultimoMensaje,
  };
}
