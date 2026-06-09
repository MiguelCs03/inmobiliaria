import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { router } from 'expo-router';
import { ChevronLeft, MapPin, Layers } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MAP_TIPO_PROPIEDAD,
  MAP_TIPO_OPERACION,
  MAP_ESTADO_PROPIEDAD
} from '@/constants/properties';

// Query de GraphQL para obtener las propiedades
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

export default function MapaScreen() {
  const insets = useSafeAreaInsets();

  // Query de Apollo Client
  const { data, loading, error, refetch } = useQuery<any>(QUERY_PROPIEDADES, {
    fetchPolicy: 'cache-and-network'
  });

  // Centro de Santa Cruz de la Sierra, Bolivia
  const defaultLat = -17.783327;
  const defaultLng = -63.182140;

  // Procesar las coordenadas y los datos de las propiedades
  const propiedadesProcesadas = useMemo(() => {
    const rawData = data?.propiedades?.data || [];
    return rawData.map((prop: any) => {
      let lat = defaultLat;
      let lng = defaultLng;
      let direccion = prop.ubicacion || 'Sin dirección';

      if (prop.ubicacion && prop.ubicacion.startsWith('{')) {
        try {
          const parsed = JSON.parse(prop.ubicacion);
          lat = parsed.lat || defaultLat;
          lng = parsed.lng || defaultLng;
          direccion = parsed.direccion || 'Sin dirección';
        } catch (e) {
          console.warn('Error parsing location JSON in Map:', e);
        }
      } else {
        // Mocking spread for legacy properties so they don't overlap in the center of Santa Cruz
        const angle = (prop.id * 137.5) * (Math.PI / 180); // golden angle spread
        const radius = 0.005 + (prop.id % 5) * 0.003; // spiral radius
        lat = defaultLat + Math.sin(angle) * radius;
        lng = defaultLng + Math.cos(angle) * radius;
      }

      const tipo = MAP_TIPO_PROPIEDAD[prop.tipoPropiedadId] || 'casa';
      const operacion = MAP_TIPO_OPERACION[prop.tipoOperacionId] || 'venta';
      const estado = MAP_ESTADO_PROPIEDAD[prop.estadoPropiedadId] || 'Disponible';

      const img = prop.imagenes && prop.imagenes.length > 0
        ? prop.imagenes[0].urlS3
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';

      return {
        id: prop.id,
        lat,
        lng,
        direccion,
        precio: prop.precioBase,
        area: prop.areaM2,
        tipo,
        operacion,
        estado,
        imagen: img
      };
    });
  }, [data]);

  // Escuchar mensajes en la web para la redirección a detalles
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebMessage = (event: MessageEvent) => {
        try {
          if (typeof event.data === 'string') {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'NAVIGATE' && parsed.id) {
              router.push(`/propiedad/${parsed.id}`);
            }
          }
        } catch {}
      };
      window.addEventListener('message', handleWebMessage);
      return () => window.removeEventListener('message', handleWebMessage);
    }
  }, []);

  // Manejar mensajes enviados desde el WebView en Móvil
  const handleMessage = (event: any) => {
    try {
      const parsed = JSON.parse(event.nativeEvent.data);
      if (parsed.type === 'NAVIGATE' && parsed.id) {
        router.push(`/propiedad/${parsed.id}`);
      }
    } catch (e) {
      console.warn('Error handling WebView message:', e);
    }
  };

  // Generar el código HTML para Leaflet con los marcadores
  const htmlContent = useMemo(() => {
    const jsonPins = JSON.stringify(propiedadesProcesadas);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <title>Mapa de Inmuebles</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .custom-popup .leaflet-popup-content {
            margin: 0;
            width: 200px !important;
          }
          .popup-img {
            width: 100%;
            height: 100px;
            object-fit: cover;
          }
          .popup-body {
            padding: 10px;
          }
          .popup-title {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
            text-transform: capitalize;
          }
          .popup-price {
            margin: 0 0 6px 0;
            font-size: 15px;
            font-weight: 800;
            color: #2563eb;
          }
          .popup-desc {
            margin: 0 0 10px 0;
            font-size: 11px;
            color: #64748b;
            line-height: 1.3;
          }
          .popup-btn {
            display: block;
            width: 100%;
            background-color: #2563eb;
            color: white;
            text-align: center;
            padding: 8px 0;
            border-radius: 8px;
            text-decoration: none;
            font-size: 11px;
            font-weight: bold;
            box-sizing: border-box;
          }
          .popup-btn:active {
            background-color: #1d4ed8;
          }
          .badge-row {
            display: flex;
            gap: 4px;
            margin-bottom: 6px;
          }
          .badge {
            font-size: 9px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
            color: white;
          }
          .badge-venta { background-color: #0f172a; }
          .badge-alquiler { background-color: #475569; }
          .badge-disponible { background-color: #10b981; }
          .badge-reservado { background-color: #f59e0b; }
          .badge-vendido { background-color: #6b7280; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const center = [${defaultLat}, ${defaultLng}];
          const map = L.map('map', {
            center: center,
            zoom: 14,
            zoomControl: false
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 20
          }).addTo(map);

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          const pins = ${jsonPins};

          // Marcadores personalizados según el estado
          const icons = {
            Disponible: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            }),
            Reservado: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            }),
            Vendido: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          };

          const formatCurrency = (val, type) => {
            const formatted = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(val);
            return type === 'alquiler' ? formatted + ' / mes' : formatted;
          };

          function sendNavigate(id) {
            const payload = JSON.stringify({ type: 'NAVIGATE', id: id });
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(payload);
            } else {
              window.parent.postMessage(payload, '*');
            }
          }

          const group = L.featureGroup();

          pins.forEach(pin => {
            const popupHtml = \`
              <div class="custom-popup">
                <img class="popup-img" src="\${pin.imagen}" />
                <div class="popup-body">
                  <div class="popup-price">\${formatCurrency(pin.precio, pin.operacion)}</div>
                  <div class="popup-title">\${pin.tipo} en \${pin.direccion.split(',')[0]}</div>
                  <div class="badge-row">
                    <span class="badge badge-\${pin.operacion}">\${pin.operacion}</span>
                    <span class="badge badge-\${pin.estado.toLowerCase()}">\${pin.estado}</span>
                  </div>
                  <div class="popup-desc">\${pin.area} m² de superficie</div>
                  <a class="popup-btn" href="javascript:void(0);" onclick="sendNavigate(\${pin.id})">VER DETALLES</a>
                </div>
              </div>
            \`;

            const icon = icons[pin.estado] || icons.Disponible;
            const marker = L.marker([pin.lat, pin.lng], { icon: icon })
              .bindPopup(popupHtml, { closeButton: false })
              .addTo(group);
          });

          group.addTo(map);

          if (pins.length > 0) {
            map.fitBounds(group.getBounds().pad(0.1));
          }
        </script>
      </body>
      </html>
    `;
  }, [propiedadesProcesadas]);

  return (
    <View style={styles.container}>
      {/* CABECERA CORPORATIVA DE MAPA */}
      <View
        className="bg-corporate-950 shadow-md flex-row items-center px-4"
        style={{ paddingTop: insets.top + 12, paddingBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center active:bg-white/20"
        >
          <ChevronLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <View className="ml-3 flex-1">
          <Text className="text-white text-lg font-black tracking-tight">
            Mapa de Inmuebles
          </Text>
          <Text className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">
            {propiedadesProcesadas.length} Propiedades Georeferenciadas
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full bg-white/10 border border-white/20 justify-center items-center">
          <MapPin size={20} color="#ffffff" />
        </View>
      </View>

      {/* CONTENEDOR DEL MAPA (WEBVIEW / IFRAME) */}
      {loading ? (
        <View className="flex-1 justify-center items-center bg-slate-50">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-slate-500 text-sm mt-3 font-semibold">
            Cargando mapa interactivo...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center bg-slate-50 p-6">
          <Layers size={48} color="#f43f5e" />
          <Text className="text-slate-800 text-base font-bold mt-4 text-center">
            Error al Cargar Mapa
          </Text>
          <Text className="text-slate-400 text-xs mt-1 text-center">
            No se pudieron obtener las propiedades para geolocalizar.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-4 bg-corporate-600 px-4 py-2 rounded-xl"
          >
            <Text className="text-white text-xs font-bold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1">
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            style={styles.map}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a'
  },
  map: {
    flex: 1,
    backgroundColor: '#f8fafc'
  }
});
