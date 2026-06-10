import { gql } from '@apollo/client';

export const SIGN_CONTRACT = gql`

mutation SignContract(

  $input:
  SignContractInput!

) {

  signContract(

    signContractInput:
      $input

  ) {

    success

    message

  }

}

`;

export const CREATE_VISITA = gql`
  mutation CreateVisita($input: CreateVisitaInput!) {
    createVisita(createVisitaInput: $input) {
      success
      message
      data {
        id
        fechaVisita
        estado
        clienteId
        empleadoId
        propiedadId
      }
    }
  }
`;

export const UPDATE_VISITA = gql`
  mutation UpdateVisita($input: UpdateVisitaInput!) {
    updateVisita(updateVisitaInput: $input) {
      success
      message
      data {
        id
        estado
      }
    }
  }
`;

export const CREAR_STRIPE_PAYMENT_INTENT = gql`
  mutation CrearStripePaymentIntent($monto: Float!) {
    crearStripePaymentIntent(monto: $monto) {
      success
      message
      clientSecret
    }
  }
`;

export const PAGAR_CUOTA = gql`
  mutation PagarCuota($input: PagarCuotaInput!) {
    pagarCuota(pagarCuotaInput: $input) {
      success
      message
      data {
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
  }
`;