import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/utils/storage';

// Claves de persistencia para el almacenamiento
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
        const tokenGuardado = await storage.getItem(TOKEN_KEY);
        const usuarioGuardado = await storage.getItem(USER_KEY);

        if (tokenGuardado && usuarioGuardado) {
          // Validamos que el JSON no sea 'undefined' o corrupto
          if (usuarioGuardado !== 'undefined') {
            const parsed = JSON.parse(usuarioGuardado);
            if (parsed && parsed.id) {
              setToken(tokenGuardado);
              setUsuario(parsed);
            }
          }
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
      await storage.setItem(TOKEN_KEY, nuevoToken);
      await storage.setItem(USER_KEY, JSON.stringify(nuevoUsuario));
      
      setToken(nuevoToken);
      setUsuario(nuevoUsuario);
    } catch (error) {
      console.error('Error al guardar credenciales en el almacenamiento:', error);
      throw error;
    }
  };

  // Función para cerrar sesión y limpiar el almacenamiento
  const cerrarSesion = async () => {
    try {
      await storage.deleteItem(TOKEN_KEY);
      await storage.deleteItem(USER_KEY);
      
      setToken(null);
      setUsuario(null);
    } catch (error) {
      console.error('Error al eliminar credenciales del almacenamiento:', error);
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
