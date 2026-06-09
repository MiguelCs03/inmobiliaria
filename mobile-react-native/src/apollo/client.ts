import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { storage } from '@/utils/storage';

// Clave para guardar el token JWT en el SecureStore
const TOKEN_KEY = 'estatecore_auth_token';

// Crear el enlace HTTP hacia el API Gateway
const httpLink = createHttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://10.0.2.2:3001/graphql',
});

// Enlace de autenticación para inyectar el token Bearer en cada petición
const authLink = setContext(async (_, { headers }) => {
  try {
    // Obtener el token almacenado de forma segura en el dispositivo
    const token = await storage.getItem(TOKEN_KEY);
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error al recuperar el token de autenticación:', error);
    return {
      headers,
    };
  }
});

// Instanciar y exportar el cliente de Apollo
export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Desactivamos caché en las consultas principales para asegurar datos en tiempo real
          propiedades: {
            merge: false,
          },
          propiedad: {
            merge: false,
          },
        },
      },
    },
  }),
});

export default client;
