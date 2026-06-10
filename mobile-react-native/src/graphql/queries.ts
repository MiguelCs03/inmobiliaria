import { gql } from "@apollo/client";

export const GET_CONTRATOS = gql`
  query {
    contratos {
      data {
        id
        titulo
        estadoContrato
        montoTotal
        cliente {
          id
          usuarioId
          nombres
          ciNit
        }
      }
    }
  }
`;

export const GET_CONTRATO = gql`
  query GetContrato($id: Int!) {
    contrato(id: $id) {
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
        cliente {
          id
          usuarioId
          nombres
          ciNit
        }
        planPagos {
          id
          contratoId
          nroCuota
          montoCuota
          estado
          facturas {
            id
            nroFactura
            montoTotal
            fechaEmision
            cuf
            codigoRecepcion
            estadoSiat
            nitCliente
            razonSocial
          }
        }
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