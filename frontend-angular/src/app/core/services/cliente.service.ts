import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private apollo = inject(Apollo);

  private readonly GET_CLIENTES = gql`
    query Clientes {

      clientes {

        data {

          id

          usuarioId

          telefono

          ciNit

          activo

          segmentoId

        }

      }

    }
  `;

  getClientes() {

    return this.apollo
      .watchQuery({
        query: this.GET_CLIENTES
      })
      .valueChanges
      .pipe(

        filter(
          (result: any) => !!result.data
        ),

        map((result: any) => {

          return result.data.clientes.data;

        })

      );

  }

}