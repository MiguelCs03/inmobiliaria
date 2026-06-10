import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface PlatformStripeProviderProps {
  children: React.ReactNode;
  publishableKey: string;
  merchantIdentifier: string;
}

export function PlatformStripeProvider({
  children,
  publishableKey,
  merchantIdentifier
}: PlatformStripeProviderProps) {
  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier={merchantIdentifier}
    >
      <>{children}</>
    </StripeProvider>
  );
}
