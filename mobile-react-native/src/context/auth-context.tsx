import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

// Claves de persistencia para SecureStore
const TOKEN_KEY = 'estatecore_auth_token';
const USER_KEY = 'estatecore_auth_user';

// Interfaz para el usuario autenticado (Agente)
export interface Usuario {
  id: number;
  correo: string;
  rolId: number;
  fotoUrl?: string;
  activo: boolean;
}

// Tipo del Contexto de Autenticación
interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  guardarSesion: (token: string, usuario: Usuario) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // Cargar sesión persistente al iniciar la app
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const tokenGuardado = await SecureStore.getItemAsync(TOKEN_KEY);
        const usuarioGuardado = await SecureStore.getItemAsync(USER_KEY);

        if (tokenGuardado && usuarioGuardado) {
          setToken(tokenGuardado);
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error al restaurar sesión guardada:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarSesion();
  }, []);

  // Función para guardar sesión al iniciar sesión exitosamente
  const guardarSesion = async (nuevoToken: string, nuevoUsuario: Usuario) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, nuevoToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nuevoUsuario));
      
      setToken(nuevoToken);
      setUsuario(nuevoUsuario);
    } catch (error) {
      console.error('Error al guardar credenciales en SecureStore:', error);
      throw error;
    }
  };

  // Función para cerrar sesión y limpiar SecureStore
  const cerrarSesion = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error('Error al eliminar credenciales en SecureStore:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, guardarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de forma segura y tipada
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
