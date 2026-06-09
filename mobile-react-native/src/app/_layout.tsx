import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { ApolloProvider } from '@apollo/client/react';
import client from '@/apollo/client';
import { AuthProvider } from '@/context/auth-context';
import { Stack } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" options={{ presentation: 'modal' }} />
            <Stack.Screen name="propiedad/[id]" />
            <Stack.Screen name="mapa" />
            <Stack.Screen name="reservar" />
            <Stack.Screen name="pago" />
          </Stack>
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
