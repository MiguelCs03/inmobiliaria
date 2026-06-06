import { gql } from "@apollo/client";

export const GET_CONTRATOS = gql`
  query {

    contratos {

      data {

        id

        titulo

        estadoContrato

      }

    }

  }
`;

export const GET_CONTRATO = gql`
  query GetContrato(
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

export const GET_PDF_URL = gql`
  query GetPdfUrl(
    $id: Int!
  ) {

    contratoPdfUrl(
      id: $id
    )

  }
`;