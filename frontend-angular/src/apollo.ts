declare module '@apollo/client' {
  namespace DeclareDefaultOptions {
    interface WatchQuery {
      errorPolicy: import('@apollo/client/core').ErrorPolicy;
    }
    interface Query {
      errorPolicy: import('@apollo/client/core').ErrorPolicy;
    }
    interface Mutate {
      errorPolicy: import('@apollo/client/core').ErrorPolicy;
    }
  }
}

export {}
