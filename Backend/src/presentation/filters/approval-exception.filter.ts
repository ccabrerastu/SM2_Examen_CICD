import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  ApprovalException,
  ApprovalRequirementsNotMetException,
  ApprovalRuleNotFoundException,
  InvalidApprovalRuleException,
  ChapterAttemptNotAllowedException,
  DuplicateEvaluationException,
  ErrorCarryOverException,
  MaxAttemptsExceededException,
  ApprovalMetricsException,
} from '../../domain/exceptions/approval.exceptions';

/**
 * Filtro global para manejar excepciones específicas del motor de aprobación
 */
@Catch(ApprovalException)
export class ApprovalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApprovalExceptionFilter.name);

  catch(exception: ApprovalException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const message = exception.message;

    // Log de la excepción para auditoría
    this.logger.error(`Approval Exception: ${exception.constructor.name} - ${message}`, {
      url: request.url,
      method: request.method,
      userId: request.user?.userId,
      timestamp: new Date().toISOString(),
      stack: exception.stack,
    });

    // Respuesta personalizada según el tipo de excepción
    const errorResponse = this.buildErrorResponse(exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception.constructor.name,
      message: message,
      ...errorResponse,
    });
  }

  private buildErrorResponse(exception: ApprovalException) {
    const baseResponse = {
      success: false,
      data: null,
    };

    switch (exception.constructor) {
      case ApprovalRequirementsNotMetException:
        return {
          ...baseResponse,
          errorType: 'APPROVAL_REQUIREMENTS_NOT_MET',
          canRetry: true,
          suggestions: [
            'Review the material and try again',
            'Focus on areas where you made mistakes',
            'Consider additional practice before retrying',
          ],
        };

      case ApprovalRuleNotFoundException:
        return {
          ...baseResponse,
          errorType: 'APPROVAL_RULE_NOT_FOUND',
          canRetry: false,
          suggestions: [
            'Contact administrator to configure approval rules',
            'Verify the chapter ID is correct',
          ],
        };

      case InvalidApprovalRuleException:
        return {
          ...baseResponse,
          errorType: 'INVALID_APPROVAL_RULE',
          canRetry: false,
          suggestions: [
            'Check the rule configuration parameters',
            'Ensure thresholds are appropriate for the chapter type',
            'Verify all required fields are provided',
          ],
        };

      case ChapterAttemptNotAllowedException:
        return {
          ...baseResponse,
          errorType: 'CHAPTER_ATTEMPT_NOT_ALLOWED',
          canRetry: false,
          suggestions: [
            'Complete prerequisite chapters first',
            'Wait for the cooldown period to expire',
            'Check if you have remaining attempts',
          ],
        };

      case DuplicateEvaluationException:
        return {
          ...baseResponse,
          errorType: 'DUPLICATE_EVALUATION',
          canRetry: false,
          suggestions: [
            'Check if the evaluation was already processed',
            'Avoid submitting duplicate requests',
          ],
        };

      case ErrorCarryOverException:
        return {
          ...baseResponse,
          errorType: 'ERROR_CARRY_OVER_FAILED',
          canRetry: true,
          suggestions: ['Try the evaluation again', 'Contact support if the problem persists'],
        };

      case MaxAttemptsExceededException:
        return {
          ...baseResponse,
          errorType: 'MAX_ATTEMPTS_EXCEEDED',
          canRetry: false,
          suggestions: [
            'Review the material thoroughly before next attempt',
            'Consider additional study time',
            'Contact instructor for guidance',
          ],
        };

      case ApprovalMetricsException:
        return {
          ...baseResponse,
          errorType: 'APPROVAL_METRICS_ERROR',
          canRetry: true,
          suggestions: [
            'Try the request again',
            'Contact support if metrics are consistently failing',
          ],
        };

      default:
        return {
          ...baseResponse,
          errorType: 'UNKNOWN_APPROVAL_ERROR',
          canRetry: true,
          suggestions: ['Try the request again', 'Contact support if the problem persists'],
        };
    }
  }
}

/**
 * Filtro para manejar todas las excepciones HTTP relacionadas con aprobación
 */
@Catch(HttpException)
export class ApprovalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApprovalHttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Solo procesar si es una excepción relacionada con aprobación
    if (!this.isApprovalRelated(request.url)) {
      throw exception; // Re-lanzar para que sea manejada por otros filtros
    }

    this.logger.error(`HTTP Exception in Approval context: ${exception.message}`, {
      url: request.url,
      method: request.method,
      userId: request.user?.userId,
      status,
      response: exceptionResponse,
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: 'HttpException',
      message: exception.message,
      success: false,
      data: null,
      details:
        typeof exceptionResponse === 'object' ? exceptionResponse : { message: exceptionResponse },
    });
  }

  private isApprovalRelated(url: string): boolean {
    return url.includes('/approval') || url.includes('/evaluate') || url.includes('/rules');
  }
}
