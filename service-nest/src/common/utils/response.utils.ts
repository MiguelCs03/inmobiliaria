import { ApiResponse } from '../interfaces/api-response.interface';

export class ResponseUtil {
  static success<T>(data: T, message: string = 'Operación exitosa'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(message: string): ApiResponse {
    return {
      success: false,
      data: null,
      message,
    };
  }
}
