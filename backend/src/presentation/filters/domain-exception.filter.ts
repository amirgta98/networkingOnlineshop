import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
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
  SmsDispatchFailedException,
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
import {
  OrderNotFoundException,
  InsufficientStockException,
  DuplicateOrderException,
  EmptyOrderException,
  InvalidOrderException,
} from '../../domain/exceptions/order.exceptions.js';
import {
  SpecialOfferNotFoundException,
  InvalidSpecialOfferException,
} from '../../domain/exceptions/special-offer.exceptions.js';

/**
 * Global NestJS Exception Filter for Domain Exceptions and Database Errors.
 * Bridges pure domain errors, database constraints, and unhandled errors
 * to clear, localized HTTP presentation responses.
 */
@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. Pass through standard NestJS HttpExceptions (e.g. ValidationPipe 400 errors, Unauthorized 401)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json(
        typeof res === 'object' ? res : { statusCode: status, message: res },
      );
    }

    let status = HttpStatus.BAD_REQUEST;
    let errorType = 'DomainError';
    let message = (exception as any)?.message || 'خطای سرور';

    if (exception instanceof DomainException) {
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
      } else if (exception instanceof SmsDispatchFailedException) {
        status = HttpStatus.BAD_GATEWAY;
        errorType = 'SmsDispatchFailed';
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
      } else if (exception instanceof OrderNotFoundException) {
        status = HttpStatus.NOT_FOUND;
        errorType = 'OrderNotFound';
      } else if (exception instanceof DuplicateOrderException) {
        status = HttpStatus.CONFLICT;
        errorType = 'DuplicateOrder';
      } else if (exception instanceof InsufficientStockException) {
        status = HttpStatus.CONFLICT;
        errorType = 'InsufficientStock';
      } else if (exception instanceof EmptyOrderException) {
        status = HttpStatus.BAD_REQUEST;
        errorType = 'EmptyOrder';
      } else if (exception instanceof InvalidOrderException) {
        status = HttpStatus.BAD_REQUEST;
        errorType = 'InvalidOrder';
      } else if (exception instanceof SpecialOfferNotFoundException) {
        status = HttpStatus.NOT_FOUND;
        errorType = 'SpecialOfferNotFound';
      } else if (exception instanceof InvalidSpecialOfferException) {
        status = HttpStatus.BAD_REQUEST;
        errorType = 'InvalidSpecialOffer';
      }

      this.logger.warn(
        `Domain Exception caught: [${errorType}] ${exception.message} on ${request.method} ${request.url}`,
      );
    } else {
      // Non-Domain Exceptions: Prisma, Multer, or unexpected
      const err = exception as any;
      const errName = err?.name || '';
      const errCode = err?.code || '';

      if (errName.includes('Prisma') || (typeof errCode === 'string' && errCode.startsWith('P'))) {
        if (errCode === 'P2002') {
          status = HttpStatus.CONFLICT;
          errorType = 'DatabaseUniqueViolation';
          message = 'اطلاعات وارد شده (مانند کد کالا SKU، نامک یا شناسه یکتا) تکراری است.';
        } else if (errCode === 'P2025') {
          status = HttpStatus.NOT_FOUND;
          errorType = 'DatabaseRecordNotFound';
          message = 'رکورد درخواستی در پایگاه داده یافت نشد.';
        } else if (errCode === 'P2000') {
          status = HttpStatus.BAD_REQUEST;
          errorType = 'DatabaseValueTooLong';
          message = 'طول یکی از مقادیر ارسالی فراتر از حد مجاز فیلد پایگاه داده است.';
        } else if (errCode === 'P2003') {
          status = HttpStatus.BAD_REQUEST;
          errorType = 'DatabaseForeignKeyViolation';
          message = 'ارتباط ارجاعی وارد شده معتبر نیست.';
        } else {
          status = HttpStatus.BAD_REQUEST;
          errorType = 'DatabaseError';
          message = 'خطایی در پردازش پایگاه داده رخ داده است.';
        }
        this.logger.error(`Prisma error [${errCode}]: ${err?.message || err}`, err?.stack);
      } else if (errName === 'MulterError') {
        status = HttpStatus.BAD_REQUEST;
        errorType = 'MulterError';
        if (errCode === 'LIMIT_FILE_SIZE') {
          message = 'حجم فایل ارسالی فراتر از حداکثر مجاز (۵ مگابایت) است.';
        } else if (errCode === 'LIMIT_FILE_COUNT') {
          message = 'تعداد فایل‌های آپلود شده فراتر از سقف مجاز است.';
        } else {
          message = 'خطا در بارگذاری فایل.';
        }
        this.logger.warn(`Multer error [${errCode}]: ${err?.message || err}`);
      } else {
        // Unexpected server error
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        errorType = 'InternalServerError';
        message = 'خطای غیرمنتظره در سرور رخ داده است. لطفاً دوباره تلاش نمایید.';
        this.logger.error(
          `Unhandled error on ${request.method} ${request.url}: ${err?.message || err}`,
          err?.stack,
        );
      }
    }

    response.status(status).json({
      statusCode: status,
      error: errorType,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
