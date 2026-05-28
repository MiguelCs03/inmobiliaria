import { inject } from '@angular/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export function apolloOptionsFactory(httpLink: HttpLink): any {
  return {
    // Se castea como any para resolver TS2352 y evitar conflicto con HttpLinkHandler
    link: httpLink.create({ uri: environment.graphqlUri }) as any,
    cache: new InMemoryCache(),
    // Se tipa la función como 'any' para evitar que el compilador rechace 'defaultOptions' (TS2353)
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  };
}

export const provideGraphQL = () => {
  return [
    provideHttpClient(),
    {
      provide: APOLLO_OPTIONS,
      useFactory: apolloOptionsFactory,
      deps: [HttpLink],
    },
    Apollo,
  ];
};
