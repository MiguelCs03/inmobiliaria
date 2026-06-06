import React from 'react';

import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

import {
  useLocalSearchParams,
} from 'expo-router';

import { useQuery } from '@apollo/client/react';

import {
  WebView,
} from 'react-native-webview';

import {
  GET_PDF_URL,
} from '@/graphql/queries';

export default function PdfScreen() {

  const { id } =
    useLocalSearchParams();

  const {
    data,
    loading,
    error,
  } = useQuery <any>(
    GET_PDF_URL,
    {
      variables: {
        id: Number(id),
      },
      skip: !id,
    },
  );

  if (loading) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <ActivityIndicator
          size="large"
        />

      </View>

    );

  }

  if (error) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <Text>
          {error.message}
        </Text>

      </View>

    );

  }

  const pdfUrl =
    data?.contratoPdfUrl;

  if (!pdfUrl) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >

        <Text>
          PDF no disponible
        </Text>

      </View>

    );

  }

  return (

    <WebView
      source={{
        uri: pdfUrl,
      }}
      style={{
        flex: 1,
      }}
    />

  );

}