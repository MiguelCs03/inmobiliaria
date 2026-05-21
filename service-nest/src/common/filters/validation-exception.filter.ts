import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

interface ValidationErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse() as ValidationErrorResponse;

    let errorMessage = 'Error de validación';

    if (exceptionResponse.message) {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join(', ');
      } else {
        errorMessage = exceptionResponse.message;
      }
    }

    const apiResponse: ApiResponse = {
      success: false,
      data: null,
      message: errorMessage,
    };

    response.status(HttpStatus.OK).json(apiResponse);
  }
}
