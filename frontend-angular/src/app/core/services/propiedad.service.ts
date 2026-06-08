import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PropiedadService {

  private apollo = inject(Apollo);

  private readonly GET_PROPIEDADES = gql`
    query Propiedades {

      propiedades {

        data {

          id

          ubicacion

          areaM2

          estadoPropiedadId

        }

      }

    }
  `;

  getPropiedades() {

    return this.apollo
      .watchQuery({
        query: this.GET_PROPIEDADES
      })
      .valueChanges
      .pipe(

        filter(
          (result: any) => !!result.data
        ),

        map((result: any) => {

          console.log(
            'PROPIEDADES GRAPHQL',
            result
          );

          return result.data.propiedades.data;

        })

      );

  }

}