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
import { InvalidPhoneNumberException } from '../../domain/exceptions/invalid-phone-number.exception.js';
import {
  OtpExpiredException,
  OtpInvalidException,
  OtpMaxAttemptsExceededException,
  OtpCooldownActiveException,
  TwoFactorRequiredException,
  TwoFactorInvalidException,
  TwoFactorExpiredException,
  SessionRevokedException,
  UserSuspendedException,
  RateLimitExceededException,
} from '../../domain/exceptions/auth.exceptions.js';
import {
  ProductNotFoundException,
  DuplicateSkuException,
  InvalidProductDataException,
  ImageProcessingException,
} from '../../domain/exceptions/product.exceptions.js';
import {
  CategoryNotFoundException,
  DuplicateCategorySlugException,
  CategoryHasProductsException,
} from '../../domain/exceptions/category.exceptions.js';
import {
  AddressNotFoundException,
  AddressOwnershipException,
  InvalidAddressDataException,
} from '../../domain/exceptions/address.exceptions.js';

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
    } else if (exception instanceof InvalidPhoneNumberException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'InvalidPhoneNumber';
    } else if (exception instanceof OtpCooldownActiveException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      errorType = 'OtpCooldownActive';
    } else if (exception instanceof RateLimitExceededException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      errorType = 'RateLimitExceeded';
    } else if (exception instanceof OtpMaxAttemptsExceededException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      errorType = 'OtpMaxAttemptsExceeded';
    } else if (exception instanceof OtpExpiredException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'OtpExpired';
    } else if (exception instanceof OtpInvalidException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'OtpInvalid';
    } else if (exception instanceof TwoFactorRequiredException) {
      status = HttpStatus.FORBIDDEN;
      errorType = 'TwoFactorRequired';
    } else if (exception instanceof TwoFactorInvalidException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'TwoFactorInvalid';
    } else if (exception instanceof TwoFactorExpiredException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'TwoFactorExpired';
    } else if (exception instanceof SessionRevokedException) {
      status = HttpStatus.UNAUTHORIZED;
      errorType = 'SessionRevoked';
    } else if (exception instanceof UserSuspendedException) {
      status = HttpStatus.FORBIDDEN;
      errorType = 'UserSuspended';
    } else if (exception instanceof ProductNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      errorType = 'ProductNotFound';
    } else if (exception instanceof DuplicateSkuException) {
      status = HttpStatus.CONFLICT;
      errorType = 'DuplicateSku';
    } else if (exception instanceof InvalidProductDataException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'InvalidProductData';
    } else if (exception instanceof ImageProcessingException) {
      status = HttpStatus.UNPROCESSABLE_ENTITY;
      errorType = 'ImageProcessingError';
    } else if (exception instanceof CategoryNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      errorType = 'CategoryNotFound';
    } else if (exception instanceof DuplicateCategorySlugException) {
      status = HttpStatus.CONFLICT;
      errorType = 'DuplicateCategorySlug';
    } else if (exception instanceof CategoryHasProductsException) {
      status = HttpStatus.CONFLICT;
      errorType = 'CategoryHasProducts';
    } else if (exception instanceof AddressNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      errorType = 'AddressNotFound';
    } else if (exception instanceof AddressOwnershipException) {
      status = HttpStatus.FORBIDDEN;
      errorType = 'AddressForbidden';
    } else if (exception instanceof InvalidAddressDataException) {
      status = HttpStatus.BAD_REQUEST;
      errorType = 'InvalidAddressData';
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
