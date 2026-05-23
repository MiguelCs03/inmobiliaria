import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

interface ValidationErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
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

    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      response.status(HttpStatus.OK).json(apiResponse);
      return;
    }

    // En GraphQL no usamos response.status, devolvemos un error GraphQL
    GqlArgumentsHost.create(host);
    return new GraphQLError(errorMessage, {
      extensions: { code: 'BAD_USER_INPUT', response: apiResponse },
    });
  }
}
