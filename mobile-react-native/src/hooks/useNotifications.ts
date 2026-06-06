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
  mutation RegistrarDispositivo($usuarioId: Int!, $tokenFcm: String!, $plataforma: String!) {
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
      console.log('Token FCM vinculado exitosamente en el backend:', data?.registrarDispositivo?.message);
    },
    onError: (error: any) => {
      console.error('Error al vincular token FCM en el backend:', error.message);
    },
  });

  // Configuracion de notificaciones en primer plano y canales de Android
  useEffect(() => {
    // Configura como se comportaran las notificaciones cuando la app esta abierta
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Configura canal de notificaciones exclusivo para Android con alta prioridad
    const configurarCanalAndroid = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('canal-inmobiliaria', {
          name: 'Alertas Inmobiliarias',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#208AEF',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
      }
    };

    configurarCanalAndroid();
  }, []);

  // Flujo A: Registro de permisos nativos, obtencion de Token y suscripcion anonima
  useEffect(() => {
    const inicializarPushNotifications = async () => {
      try {
        // Validacion de hardware: Las notificaciones push requieren un dispositivo fisico
        if (!Device.isDevice) {
          console.warn('Debe utilizar un dispositivo fisico para recibir notificaciones push.');
          return;
        }

        // Verificar permisos actuales
        const estadoExistenteRes = await Notifications.getPermissionsAsync() as any;
        const estadoExistente = estadoExistenteRes.status;
        let estadoFinal = estadoExistente;

        // Si no se han solicitado permisos, se solicitan de forma nativa
        if (estadoExistente !== 'granted') {
          const nuevoEstadoRes = await Notifications.requestPermissionsAsync() as any;
          estadoFinal = nuevoEstadoRes.status;
        }

        // Validacion de respuesta del usuario
        if (estadoFinal !== 'granted') {
          console.warn('Permisos de notificacion denegados por el usuario.');
          setPermisoConcedido(false);
          return;
        }

        setPermisoConcedido(true);

        // Obtener el token FCM nativo del dispositivo
        let fcmTokenStr = '';
        if (Platform.OS === 'android') {
          // En Android, obtenemos el token de forma directa desde Firebase Messaging
          fcmTokenStr = await messaging().getToken();
        } else {
          // En iOS, solicitamos primero el token APNs y luego el token FCM para compatibilidad
          await messaging().registerDeviceForRemoteMessages();
          fcmTokenStr = await messaging().getToken();
        }

        if (fcmTokenStr) {
          setTokenFcm(fcmTokenStr);
          console.log('Token FCM obtenido correctamente:', fcmTokenStr);

          // FLUJO A: Suscripcion automatica a temas globales para clientes sin login
          // Permite enviar alertas masivas sobre nuevos inmuebles sin necesidad de un usuario_id
          await messaging().subscribeToTopic('nuevas-propiedades');
          console.log('Dispositivo suscrito exitosamente al tema: nuevas-propiedades');
        }
      } catch (error) {
        console.error('Error al inicializar el sistema de notificaciones push:', error);
      }
    };

    inicializarPushNotifications();
  }, []);

  // Flujo B: Vinculacion automatica del dispositivo al iniciar sesion
  useEffect(() => {
    // Si el usuario esta logueado, tenemos un token FCM valido y no ha sido registrado
    if (usuario && usuario.id && tokenFcm && tokenRegistradoRef.current !== tokenFcm) {
      const registrarTokenEnBackend = async () => {
        try {
          await vincularToken({
            variables: {
              usuarioId: usuario.id,
              tokenFcm: tokenFcm,
              plataforma: Platform.OS,
            },
          });
          // Marcamos el token como registrado para evitar bucles de peticiones
          tokenRegistradoRef.current = tokenFcm;
        } catch (err) {
          console.error('Fallo el intento de vinculacion de dispositivo en el backend:', err);
        }
      };

      registrarTokenEnBackend();
    }

    // Si el usuario cierra sesion, limpiamos la referencia de registro
    if (!usuario) {
      tokenRegistradoRef.current = null;
    }
  }, [usuario, tokenFcm, vincularToken]);

  // Manejo de listeners para recibir y presionar notificaciones
  useEffect(() => {
    // Escucha de notificaciones recibidas en primer plano (Foreground)
    const listenerRecibido = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificacion recibida en primer plano:', notification);
      setUltimoMensaje(notification);
    });

    // Escucha de interaccion del usuario con la notificacion (Click)
    const listenerRespuesta = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('El usuario interactuo con la notificacion:', response);
      // Aqui se puede procesar la ruta interna recibida en el payload para navegacion
      const datosExtra = response.notification.request.content.data;
      if (datosExtra && typeof datosExtra === 'object' && 'ruta' in datosExtra) {
        console.log('Redirigiendo a la ruta especificada:', datosExtra.ruta);
      }
    });

    // Limpieza de listeners nativos al desmontar el hook
    return () => {
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
