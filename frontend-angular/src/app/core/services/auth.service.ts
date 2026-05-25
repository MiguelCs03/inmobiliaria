import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

// Interfaces altamente tipadas para la respuesta de GraphQL
export interface Usuario {
  id: string;
  correo: string;
  rolId: number;
  activo: boolean;
}

export interface LoginData {
  token: string;
  usuario: Usuario;
}

export interface LoginResponse {
  login: {
    success: boolean;
    message: string;
    data: LoginData | null;
  };
}

export interface LoginInput {
  correo: string;
  contrasenia: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apollo = inject(Apollo);

  // Mutación GraphQL exacta requerida por el backend a través del Gateway
  private readonly LOGIN_MUTATION = gql`
    mutation Login($loginInput: LoginInput!) {
      login(loginInput: $loginInput) {
        success
        message
        data {
          token
          usuario {
            id
            correo
            rolId
            activo
          }
        }
      }
    }
  `;

  /**
   * Realiza el inicio de sesión del usuario utilizando la mutación GraphQL.
   * @param input Credenciales de inicio de sesión (correo y contrasenia).
   */
  login(input: LoginInput): Observable<LoginResponse['login']> {
    return this.apollo
      .mutate<LoginResponse>({
        mutation: this.LOGIN_MUTATION,
        variables: {
          loginInput: input,
        },
      })
      .pipe(
        map((result) => {
          if (!result.data || !result.data.login) {
            throw new Error('Respuesta inválida del servidor.');
          }
          return result.data.login;
        }),
        tap((loginResult) => {
          // Persistir token y rolId de forma segura si la autenticación fue exitosa
          if (loginResult.success && loginResult.data) {
            this.saveSession(loginResult.data.token, loginResult.data.usuario.rolId);
          }
        }),
        catchError((error) => {
          // Manejo avanzado de errores de GraphQL/Red
          console.error('Error de autenticación:', error);
          return throwError(() => error);
        })
      );
    }

  /**
   * Guarda de forma segura los datos de sesión en el almacenamiento local.
   */
  private saveSession(token: string, rolId: number): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', rolId.toString());
    }
  }

  /**
   * Remueve los datos de sesión (Cerrar sesión).
   */
  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
    }
  }

  /**
   * Obtiene el token guardado actualmente.
   */
  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  /**
   * Obtiene el rolId del usuario guardado.
   */
  getUserRole(): number | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('user_role');
      return role ? parseInt(role, 10) : null;
    }
    return null;
  }

  /**
   * Valida si el usuario está autenticado.
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
