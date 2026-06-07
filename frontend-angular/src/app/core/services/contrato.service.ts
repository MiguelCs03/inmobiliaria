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
  GET_CONTRATO_BY_ID = gql`
query GetContratoById(
  $id: Int!
) {

  contrato(
    id: $id
  ) {

    success

    message

    data {

      id

      titulo

      montoTotal

      observaciones

      estadoContrato

      pdfUrl

      blockchainContractId

      documentHash

      firmas {

        id

        tipoFirmante

        fechaFirma

        signatureUrl

      }

    }

  }

}
`;


  getContratoById(
    id: number
  ) {

    return this.apollo.query({

      query: this.GET_CONTRATO_BY_ID,

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

  private readonly GENERATE_PDF = gql`

  mutation GenerateContractPdf(
    $id:Int!
  ){

    generateContractPdf(
      id:$id
    ){

      success

      message

      data{

        id

        pdfUrl

      }

    }

  }
  `;

  generatePdf(
    id: number
  ) {

    return this.apollo.mutate({

      mutation: this.GENERATE_PDF,

      variables: {
        id
      }

    });

  }

  REGISTER_BLOCKCHAIN = gql`
  mutation RegisterBlockchain($id: Int!) {

    registerBlockchain(
      id: $id
    ) {

      success

      message

      data {

        id

        documentHash

        blockchainContractId

        estadoContrato

      }

    }

  }
`;

  registerBlockchain(
    id: number
  ) {

    return this.apollo
      .mutate({

        mutation:
          this.REGISTER_BLOCKCHAIN,

        variables: {
          id
        }

      })
      .pipe(

        map((result: any) => {

          return result.data
            .registerBlockchain;

        })

      );

  }

  GET_PDF_URL = gql`
  query GetPdfUrl(
    $id: Int!
  ) {

    contratoPdfUrl(
      id: $id
    )

  }
  `;

  getPdfUrl(
    id: number
  ) {

    return this.apollo
      .query({

        query:
          this.GET_PDF_URL,

        variables: {
          id
        }

      })
      .pipe(

        map((result: any) =>

          result.data
            .contratoPdfUrl

        )

      );

  }

  GENERATE_SIGNED_PDF = gql`
mutation GenerateSignedPdf(
  $id: Int!
) {

  generateSignedPdf(
    id: $id
  ) {

    success

    message

    data {

      id

      pdfUrl

    }

  }

}
`;

  generateSignedPdf(
    id: number
  ) {

    return this.apollo
      .mutate({

        mutation:
          this.GENERATE_SIGNED_PDF,

        variables: {
          id,
        },

      });

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
