import { useStripe } from '@stripe/stripe-react-native';

export function usePlatformStripe() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  return {
    isWeb: false,
    initPaymentSheet,
    presentPaymentSheet,
  };
}
