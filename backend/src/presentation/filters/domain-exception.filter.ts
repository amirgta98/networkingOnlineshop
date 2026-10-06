import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception.js';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception.js';
import { UserNotFoundException } from '../../domain/exceptions/user-not-found.exception.js';
import { InvalidEmailException } from '../../domain/exceptions/invalid-email.exception.js';

/**
 * Global NestJS Exception Filter for Domain Exceptions.
 * Bridges pure domain errors to HTTP presentation status codes.
 * This ensures the domain layer remains 100% agnostic of HTTP/NestJS.
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.BAD_REQUEST;
    let errorType = 'DomainError';

    if (exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      errorType = 'UserAlreadyExists';
    } else if (exception instanceof UserNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      errorType = 'UserNotFound';
    } else if (exception instanceof InvalidEmailException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'InvalidEmail';
    }

    this.logger.warn(
      `Domain Exception caught: [${errorType}] ${exception.message} on ${request.method} ${request.url}`,
    );

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
