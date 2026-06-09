import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface Visita {
  id: number;
  propiedadId: number;
  clienteId: number;
  empleadoId: number;
  fechaVisita: string;
  estado: string;
  propiedad?: {
    id: number;
    ubicacion: string | null;
    precioBase: number;
    areaM2: number;
  };
  cliente?: {
    id: number;
    nombres: string;
    telefono: string;
  };
  empleado?: {
    id: number;
    nombres: string;
    apellidos: string;
    usuarioId: number;
  };
}

interface VisitasResponse {
  visitas: {
    success: boolean;
    message: string;
    data: Visita[] | null;
  };
}

interface UpdateVisitaResponse {
  updateVisita: {
    success: boolean;
    message: string;
    data: Visita | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VisitaService {
  private apollo = inject(Apollo);

  private readonly GET_VISITAS = gql`
    query GetVisitas {
      visitas {
        success
        message
        data {
          id
          propiedadId
          clienteId
          empleadoId
          fechaVisita
          estado
          propiedad {
            id
            ubicacion
            precioBase
            areaM2
          }
          cliente {
            id
            nombres
            telefono
          }
          empleado {
            id
            nombres
            apellidos
            usuarioId
          }
        }
      }
    }
  `;

  private readonly UPDATE_VISITA = gql`
    mutation UpdateVisita($input: UpdateVisitaInput!) {
      updateVisita(updateVisitaInput: $input) {
        success
        message
        data {
          id
          estado
          fechaVisita
        }
      }
    }
  `;

  getVisitas(): Observable<Visita[]> {
    return this.apollo
      .watchQuery<VisitasResponse>({
        query: this.GET_VISITAS,
        fetchPolicy: 'network-only'
      })
      .valueChanges
      .pipe(
        filter((result: any) => !!result.data),
        map((result: any) => result.data.visitas.data || [])
      );
  }

  updateVisita(id: number, estado: string): Observable<any> {
    return this.apollo
      .mutate<UpdateVisitaResponse>({
        mutation: this.UPDATE_VISITA,
        variables: {
          input: {
            id,
            estado
          }
        }
      })
      .pipe(
        map((result: any) => {
          if (!result.data || !result.data.updateVisita) {
            throw new Error('Respuesta inválida al actualizar estado de la visita.');
          }
          return result.data.updateVisita;
        })
      );
  }
}
