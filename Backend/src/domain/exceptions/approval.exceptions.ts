import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción base para errores relacionados con el motor de aprobación
 */
export abstract class ApprovalException extends HttpException {
  constructor(message: string, status: HttpStatus) {
    super(message, status);
  }
}

/**
 * Excepción lanzada cuando un usuario no cumple con los requisitos de aprobación
 */
export class ApprovalRequirementsNotMetException extends ApprovalException {
  constructor(chapterId: string, score: number, requiredScore: number) {
    super(
      `Approval requirements not met for chapter ${chapterId}. Score: ${score}%, Required: ${requiredScore}%`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Excepción lanzada cuando se intenta evaluar un capítulo sin reglas configuradas
 */
export class ApprovalRuleNotFoundException extends ApprovalException {
  constructor(chapterId: string) {
    super(`No approval rule found for chapter ${chapterId}`, HttpStatus.NOT_FOUND);
  }
}

/**
 * Excepción lanzada cuando se intenta configurar una regla con parámetros inválidos
 */
export class InvalidApprovalRuleException extends ApprovalException {
  constructor(reason: string) {
    super(`Invalid approval rule configuration: ${reason}`, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Excepción lanzada cuando un usuario no puede intentar un capítulo debido a restricciones
 */
export class ChapterAttemptNotAllowedException extends ApprovalException {
  constructor(chapterId: string, reason: string) {
    super(`Chapter ${chapterId} attempt not allowed: ${reason}`, HttpStatus.FORBIDDEN);
  }
}

/**
 * Excepción lanzada cuando se detecta un intento de evaluación duplicada
 */
export class DuplicateEvaluationException extends ApprovalException {
  constructor(userId: string, chapterId: string) {
    super(
      `Duplicate evaluation detected for user ${userId} on chapter ${chapterId}`,
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Excepción lanzada cuando hay errores en el arrastre de errores entre intentos
 */
export class ErrorCarryOverException extends ApprovalException {
  constructor(message: string) {
    super(`Error carry-over processing failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Excepción lanzada cuando se excede el límite de intentos para un capítulo
 */
export class MaxAttemptsExceededException extends ApprovalException {
  constructor(chapterId: string, maxAttempts: number) {
    super(
      `Maximum attempts (${maxAttempts}) exceeded for chapter ${chapterId}`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Excepción lanzada cuando hay problemas con las métricas de aprobación
 */
export class ApprovalMetricsException extends ApprovalException {
  constructor(message: string) {
    super(`Approval metrics error: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
