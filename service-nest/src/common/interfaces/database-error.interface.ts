/**
 * Interface for PostgreSQL database errors
 */
export interface DatabaseError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
  schema?: string;
}

/**
 * Type guard to check if an error is a DatabaseError
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string' &&
    'message' in error
  );
}
