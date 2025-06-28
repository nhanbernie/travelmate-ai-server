import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { ResponseBuilder } from '../interfaces/response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    } else if (this.isMongoError(exception)) {
      // Handle MongoDB duplicate key error
      status = HttpStatus.CONFLICT;
      const field =
        Object.keys((exception as any).keyPattern || {})[0] || 'field';
      message = `${field} already exists`;
    }

    // Log the error
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    const errorResponse = ResponseBuilder.error(message, status);
    response.status(status).json(errorResponse);
  }

  private isMongoError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as any).code === 11000
    );
  }
}
