  /**
   * PostgreSQL error codes
   */
  export enum PostgresErrorCode {
    UNIQUE_VIOLATION = '23505',
    FOREIGN_KEY_VIOLATION = '23503',
    NOT_NULL_VIOLATION = '23502',
    CHECK_VIOLATION = '23514',
  }

  /**
   * Custom error messages
   */
  export const DATABASE_ERROR_MESSAGES = {
    [PostgresErrorCode.UNIQUE_VIOLATION]: 'Record already exists in database',
    [PostgresErrorCode.FOREIGN_KEY_VIOLATION]: 'Foreign key constraint violation',
    [PostgresErrorCode.NOT_NULL_VIOLATION]: 'Required field cannot be null',
    [PostgresErrorCode.CHECK_VIOLATION]: 'Check constraint violation',
  } as const;
