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