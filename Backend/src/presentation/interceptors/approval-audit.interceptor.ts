import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Interceptor para auditoría y logging de operaciones del motor de aprobación
 */
@Injectable()
export class ApprovalAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApprovalAuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, body, params, query } = request;
    const user = request.user;

    const startTime = Date.now();
    const requestId = this.generateRequestId();

    // Log de inicio de operación
    this.logger.log(`[${requestId}] APPROVAL_OPERATION_START: ${method} ${url}`, {
      requestId,
      method,
      url,
      userId: user?.userId,
      userEmail: user?.email,
      userRole: user?.role,
      params: this.sanitizeParams(params),
      query: this.sanitizeQuery(query),
      bodyKeys: body ? Object.keys(body) : [],
      timestamp: new Date().toISOString(),
    });

    // Log específico según el tipo de operación
    this.logOperationSpecifics(url, method, body, user, requestId);

    return next.handle().pipe(
      tap(response => {
        const duration = Date.now() - startTime;

        // Log de operación exitosa
        this.logger.log(
          `[${requestId}] APPROVAL_OPERATION_SUCCESS: ${method} ${url} - ${duration}ms`,
          {
            requestId,
            method,
            url,
            userId: user?.userId,
            duration,
            responseType: response?.constructor?.name || 'Unknown',
            success: true,
            timestamp: new Date().toISOString(),
          },
        );

        // Log específico de resultado
        this.logOperationResult(url, method, response, user, requestId, duration);
      }),
      catchError(error => {
        const duration = Date.now() - startTime;

        // Log de error
        this.logger.error(
          `[${requestId}] APPROVAL_OPERATION_ERROR: ${method} ${url} - ${duration}ms`,
          {
            requestId,
            method,
            url,
            userId: user?.userId,
            duration,
            error: error.message,
            errorType: error.constructor.name,
            success: false,
            timestamp: new Date().toISOString(),
            stack: error.stack,
          },
        );

        throw error;
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeParams(params: Record<string, unknown>): Record<string, unknown> {
    if (!params) return {};

    // Remover información sensible de los parámetros
    const sanitized = { ...params };
    delete sanitized.password;
    delete sanitized.token;

    return sanitized;
  }

  private sanitizeQuery(query: Record<string, unknown>): Record<string, unknown> {
    if (!query) return {};

    // Remover información sensible de la query
    const sanitized = { ...query };
    delete sanitized.password;
    delete sanitized.token;

    return sanitized;
  }

  private logOperationSpecifics(
    url: string,
    method: string,
    body: Record<string, unknown>,
    user: Record<string, unknown> | undefined,
    requestId: string,
  ): void {
    if (url.includes('/evaluate') && method === 'POST') {
      this.logger.log(`[${requestId}] APPROVAL_EVALUATION_ATTEMPT`, {
        requestId,
        evaluatorUserId: user?.userId,
        targetUserId: body?.userId,
        chapterId: body?.chapterId,
        score: body?.score,
        timeSpent: body?.timeSpent,
        hasAdditionalData: !!body?.additionalData,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.includes('/batch-evaluate') && method === 'POST') {
      const evaluations = body?.evaluations as Array<Record<string, unknown>> | undefined;
      this.logger.log(`[${requestId}] APPROVAL_BATCH_EVALUATION_ATTEMPT`, {
        requestId,
        evaluatorUserId: user?.userId,
        evaluationCount: evaluations?.length || 0,
        targetUserIds: evaluations?.map((e: Record<string, unknown>) => e.userId) || [],
        chapterIds: evaluations?.map((e: Record<string, unknown>) => e.chapterId) || [],
        timestamp: new Date().toISOString(),
      });
    }

    if (url.includes('/rules') && method === 'POST') {
      this.logger.log(`[${requestId}] APPROVAL_RULE_CONFIGURATION`, {
        requestId,
        configuratorUserId: user?.userId,
        chapterId: body?.chapterId,
        threshold: body?.minScoreThreshold,
        maxAttempts: body?.maxAttempts,
        allowErrorCarryover: body?.allowErrorCarryover,
        isActive: body?.isActive,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.includes('/can-attempt') && method === 'GET') {
      this.logger.log(`[${requestId}] APPROVAL_ATTEMPT_CHECK`, {
        requestId,
        checkerUserId: user?.userId,
        targetUserId: url.match(/\/users\/([^\/]+)\/can-attempt/)?.[1],
        chapterId: url.match(/chapter\/([^\/\?]+)/)?.[1],
        timestamp: new Date().toISOString(),
      });
    }
  }

  private logOperationResult(
    url: string,
    method: string,
    response: Record<string, unknown>,
    user: Record<string, unknown> | undefined,
    requestId: string,
    duration: number,
  ): void {
    if (url.includes('/evaluate') && method === 'POST') {
      this.logger.log(`[${requestId}] APPROVAL_EVALUATION_RESULT`, {
        requestId,
        evaluatorUserId: user?.userId,
        evaluationId: response?.evaluationId,
        status: response?.status,
        originalScore: response?.score,
        adjustedScore: response?.adjustedScore,
        threshold: response?.threshold,
        attemptNumber: response?.attemptNumber,
        errorsCarriedOver: response?.errorsCarriedOver,
        canRetry: response?.canRetry,
        duration,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.includes('/batch-evaluate') && method === 'POST') {
      const results = response?.results as Array<unknown> | undefined;
      const errors = response?.errors as Array<unknown> | undefined;
      this.logger.log(`[${requestId}] APPROVAL_BATCH_EVALUATION_RESULT`, {
        requestId,
        evaluatorUserId: user?.userId,
        successfulEvaluations: results?.length || 0,
        failedEvaluations: errors?.length || 0,
        totalProcessed: (results?.length || 0) + (errors?.length || 0),
        duration,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.includes('/rules') && (method === 'POST' || method === 'PUT')) {
      this.logger.log(`[${requestId}] APPROVAL_RULE_CONFIGURATION_RESULT`, {
        requestId,
        configuratorUserId: user?.userId,
        ruleId: response?.id,
        chapterId: response?.chapterId,
        threshold: response?.minScoreThreshold,
        isActive: response?.isActive,
        operation: method === 'POST' ? 'CREATE' : 'UPDATE',
        duration,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
