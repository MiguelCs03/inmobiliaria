import { Injectable, inject } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { gql } from '@apollo/client/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

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

const TOKEN_DURATION_MS = 2 * 60 * 60 * 1000;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apollo = inject(Apollo);

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

  login(input: LoginInput): Observable<LoginResponse['login']> {
    return this.apollo
      .mutate<LoginResponse>({
        mutation: this.LOGIN_MUTATION,
        variables: {
          loginInput: input,
        },
      })
      .pipe(
        map((result: any) => {
          if (result.error?.graphQLErrors?.length > 0) {
            const msg = result.error.graphQLErrors[0]?.message || 'Credenciales inválidas';
            throw new Error(msg);
          }
          if (!result.data?.login) {
            throw new Error('Respuesta inválida del servidor.');
          }
          return result.data.login;
        }),
        tap((loginResult) => {
          if (loginResult.success && loginResult.data) {
            // Guardamos el token, rol, id de usuario y su correo en localStorage
            this.saveSession(
              loginResult.data.token, 
              loginResult.data.usuario.rolId, 
              loginResult.data.usuario.id, 
              loginResult.data.usuario.correo
            );
          }
        }),
        catchError((error) => {
          console.error('Error de autenticación:', error);
          const message = error.message || 'Error en el servidor. Intente más tarde.';
          return throwError(() => new Error(message));
        })
      );
    }

  private saveSession(token: string, rolId: number, userId: string, correo: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', rolId.toString());
      localStorage.setItem('user_id', userId);
      localStorage.setItem('user_email', correo);
      localStorage.setItem('token_expires_at', (Date.now() + TOKEN_DURATION_MS).toString());
    }
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name'); // Limpiar datos de perfil locales
      localStorage.removeItem('user_lastname');
      localStorage.removeItem('user_phone');
      localStorage.removeItem('user_photo');
      localStorage.removeItem('token_expires_at');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  getUserRole(): number | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const role = localStorage.getItem('user_role');
      return role ? parseInt(role, 10) : null;
    }
    return null;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
      this.logout();
      return false;
    }
    return true;
  }

  // Mutación GraphQL para cambiar la contraseña del usuario a través del API Gateway
  private readonly CAMBIAR_CONTRASENIA_MUTATION = gql`
    mutation CambiarContrasenia($input: CambiarContraseniaInput!) {
      cambiarContrasenia(cambiarContraseniaInput: $input) {
        success
        message
        data {
          id
          correo
          rolId
          activo
        }
      }
    }
  `;

  /**
   * Cambia la contraseña del usuario actual de manera segura.
   * @param id Identificador numérico del usuario.
   * @param nueva Contraseña nueva a establecer.
   */
  cambiarContrasenia(id: number, nueva: string): Observable<any> {
    return this.apollo.mutate({
      mutation: this.CAMBIAR_CONTRASENIA_MUTATION,
      variables: {
        input: {
          id: id,
          nueva: nueva
        }
      }
    }).pipe(
      map((result: any) => {
        if (!result.data || !result.data.cambiarContrasenia) {
          throw new Error('Respuesta inválida del servidor al cambiar contraseña.');
        }
        return result.data.cambiarContrasenia;
      })
    );
  }

  getUserId(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('user_id');
    }
    return null;
  }

  getUserEmail(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('user_email');
    }
    return null;
  }
}
