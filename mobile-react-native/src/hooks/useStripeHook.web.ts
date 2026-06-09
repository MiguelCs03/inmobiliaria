export function usePlatformStripe() {
  return {
    isWeb: true,
    initPaymentSheet: async (params: any) => {
      console.log('Web Mock initPaymentSheet called with params:', params);
      return { error: null };
    },
    presentPaymentSheet: async () => {
      console.log('Web Mock presentPaymentSheet called');
      return { error: null };
    },
  };
}
