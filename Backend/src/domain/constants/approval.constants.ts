/**
 * Constantes para el Motor de Reglas de Aprobación
 * Centraliza todos los valores de configuración y umbrales
 */

export const APPROVAL_CONSTANTS = {
  // Umbrales de aprobación por defecto
  DEFAULT_SCORE_THRESHOLD: 80,
  CRITICAL_CHAPTERS_THRESHOLD: 100,

  // Capítulos críticos que requieren 100%
  CRITICAL_CHAPTERS: [4, 5],

  // Límites de intentos
  DEFAULT_MAX_ATTEMPTS: 3,
  UNLIMITED_ATTEMPTS: -1,

  // Configuración de arrastre de errores
  DEFAULT_ERROR_CARRYOVER: true,
  ERROR_CARRYOVER_LIMIT: 5,

  // Estados de evaluación
  EVALUATION_STATUS: {
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PENDING: 'pending',
    REQUIRES_REVIEW: 'requires_review',
  } as const,

  // Tipos de evaluación
  EVALUATION_TYPES: {
    AUTOMATIC: 'automatic',
    MANUAL: 'manual',
    HYBRID: 'hybrid',
  } as const,

  // Prioridades de reglas
  RULE_PRIORITIES: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  } as const,

  // Límites de validación
  VALIDATION_LIMITS: {
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    MIN_THRESHOLD: 0,
    MAX_THRESHOLD: 100,
    MIN_CHAPTER_ID: 1,
    MAX_CHAPTER_ID: 20,
    MIN_ATTEMPTS: 1,
    MAX_ATTEMPTS: 10,
    MAX_ERRORS_PER_EVALUATION: 50,
  },

  // Configuración de métricas
  METRICS: {
    RETENTION_DAYS: 365,
    BATCH_SIZE: 100,
    CACHE_TTL: 3600, // 1 hora en segundos
  },

  // Mensajes de error estándar
  ERROR_MESSAGES: {
    INVALID_SCORE: 'El puntaje debe estar entre 0 y 100',
    INVALID_THRESHOLD: 'El umbral debe estar entre 0 y 100',
    INVALID_CHAPTER: 'ID de capítulo inválido',
    INVALID_ATTEMPTS: 'Número de intentos inválido',
    RULE_NOT_FOUND: 'Regla de aprobación no encontrada',
    REQUIREMENTS_NOT_MET: 'No se cumplen los requisitos de aprobación',
    MAX_ATTEMPTS_EXCEEDED: 'Se ha excedido el número máximo de intentos',
    CRITICAL_CHAPTER_FAILED: 'Los capítulos críticos requieren 100% de aprobación',
  },

  // Configuración de logging
  LOGGING: {
    AUDIT_ENABLED: true,
    LOG_LEVEL: 'info',
    SENSITIVE_FIELDS: ['userId', 'email'],
  },
};

// Tipos derivados de las constantes
export type EvaluationStatus =
  (typeof APPROVAL_CONSTANTS.EVALUATION_STATUS)[keyof typeof APPROVAL_CONSTANTS.EVALUATION_STATUS];
export type EvaluationType =
  (typeof APPROVAL_CONSTANTS.EVALUATION_TYPES)[keyof typeof APPROVAL_CONSTANTS.EVALUATION_TYPES];
export type RulePriority =
  (typeof APPROVAL_CONSTANTS.RULE_PRIORITIES)[keyof typeof APPROVAL_CONSTANTS.RULE_PRIORITIES];

// Funciones de utilidad
export class ApprovalUtils {
  /**
   * Verifica si un capítulo es crítico
   */
  static isCriticalChapter(chapterId: number): boolean {
    return APPROVAL_CONSTANTS.CRITICAL_CHAPTERS.includes(chapterId);
  }

  /**
   * Obtiene el umbral requerido para un capítulo
   */
  static getRequiredThreshold(chapterId: number): number {
    return this.isCriticalChapter(chapterId)
      ? APPROVAL_CONSTANTS.CRITICAL_CHAPTERS_THRESHOLD
      : APPROVAL_CONSTANTS.DEFAULT_SCORE_THRESHOLD;
  }

  /**
   * Valida si un puntaje es válido
   */
  static isValidScore(score: number): boolean {
    return (
      score >= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MIN_SCORE &&
      score <= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MAX_SCORE
    );
  }

  /**
   * Valida si un umbral es válido
   */
  static isValidThreshold(threshold: number): boolean {
    return (
      threshold >= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MIN_THRESHOLD &&
      threshold <= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MAX_THRESHOLD
    );
  }

  /**
   * Valida si un ID de capítulo es válido
   */
  static isValidChapterId(chapterId: number): boolean {
    return (
      Number.isInteger(chapterId) &&
      chapterId >= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MIN_CHAPTER_ID &&
      chapterId <= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MAX_CHAPTER_ID
    );
  }

  /**
   * Valida si el número de intentos es válido
   */
  static isValidAttemptCount(attempts: number): boolean {
    return (
      attempts === APPROVAL_CONSTANTS.UNLIMITED_ATTEMPTS ||
      (Number.isInteger(attempts) &&
        attempts >= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MIN_ATTEMPTS &&
        attempts <= APPROVAL_CONSTANTS.VALIDATION_LIMITS.MAX_ATTEMPTS)
    );
  }

  /**
   * Sanitiza datos sensibles para logging
   */
  static sanitizeForLogging(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data } as Record<string, unknown>;
    APPROVAL_CONSTANTS.LOGGING.SENSITIVE_FIELDS.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
