import { Injectable, inject } from "@angular/core";
import { Apollo } from "apollo-angular";
import { gql } from "apollo-angular";
import { map, filter } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

  private apollo = inject(Apollo);

  private readonly CREATE_CONTRACT = gql`
    mutation CreateContrato(
      $input: CreateContratoInput!
    ) {

      createContrato(
        createContratoInput: $input
      ) {

        success

        message

        data {

          id

          titulo

          estadoContrato

          montoTotal

        }
      }
    }
  `;

  createContrato(input: any) {

    return this.apollo
      .mutate({
        mutation: this.CREATE_CONTRACT,

        variables: {
          input
        }
      })
      .pipe(
        map((result: any) =>
          result.data.createContrato
        )
      );
  }

  //para obtener contratos
  private readonly GET_CONTRACTS = gql`
  query {

    contratos {

      success

      message

      data {

        id

        titulo

        montoTotal

        estadoContrato

      }

    }

  }
  `;

  getContratos() {

    return this.apollo
      .watchQuery({
        query: this.GET_CONTRACTS
      })
      .valueChanges
      .pipe(

        filter(
          (result: any) => !!result.data
        ),

        map((result: any) => {

          return result.data.contratos.data;

        })

      );
  }

  //ahora vamos a pasar a detallar cada contrato, para pasar a firmas y demás
  private readonly GET_CONTRATO = gql`

query Contrato(
  $id: Int!
){

  contrato(
    id: $id
  ){

    success

    message

    data {

      id

      titulo

      montoTotal

      observaciones

      estadoContrato

      fechaInicio

      fechaFin

      clienteId

      propiedadId

      empleadoId

    }

  }

}
`;


  getContratoById(
    id: number
  ) {

    return this.apollo.query({

      query: this.GET_CONTRATO,

      variables: {
        id
      }

    })
      .pipe(
        filter(
          (result: any) => !!result.data
        ),

        map((result: any) => {

          return result.data.contrato.data;

        })


      );

  }
  // getContratos(){

  // return this.apollo
  //   .watchQuery({
  //     query: this.GET_CONTRACTS
  //   })
  //   .valueChanges
  //   .pipe(
  //     map((result: any) => {

  //       console.log(
  //         'GRAPHQL RESPONSE',
  //         result
  //       );

  //       return result.data.contratos.data;
  //     })
  //   );
  // }

}
