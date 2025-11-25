import { DocumentBuilder, SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Configuración de Swagger específica para el Motor de Reglas de Aprobación
 */
export class ApprovalSwaggerConfig {
  /**
   * Configura la documentación de Swagger para el módulo de aprobación
   */
  static setup(app: INestApplication): void {
    const config = new DocumentBuilder()
      .setTitle('Motor de Reglas de Aprobación API')
      .setDescription(
        `
        API para el Motor de Reglas de Aprobación del sistema de aprendizaje de inglés.
        
        ## Características principales:
        - **Evaluación automática**: Validación de resultados según umbrales definidos
        - **Reglas configurables**: Gestión de reglas de aprobación por capítulo
        - **Capítulos críticos**: Manejo especial para capítulos 4 y 5 (requieren 100%)
        - **Arrastre de errores**: Seguimiento de errores entre intentos
        - **Métricas y auditoría**: Registro completo de evaluaciones y estadísticas
        
        ## Umbrales de aprobación:
        - **General**: 80% de aprobación
        - **Capítulos críticos (4 y 5)**: 100% de aprobación
        
        ## Estados de evaluación:
        - **approved**: Evaluación aprobada
        - **rejected**: Evaluación rechazada
        - **pending**: Evaluación pendiente
        - **requires_review**: Requiere revisión manual
      `,
      )
      .setVersion('1.0')
      .addTag('approval-evaluation', 'Endpoints para evaluación de aprobación')
      .addTag('approval-rules', 'Endpoints para gestión de reglas de aprobación')
      .addTag('approval-metrics', 'Endpoints para métricas y estadísticas')
      .addTag('approval-history', 'Endpoints para historial de evaluaciones')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Token JWT para autenticación',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer('http://localhost:3000', 'Servidor de desarrollo')
      .addServer('https://api.englishapp.com', 'Servidor de producción')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      include: [], // Se incluirán todos los módulos por defecto
      deepScanRoutes: true,
      operationIdFactory: (controllerKey: string, methodKey: string) => {
        return `${controllerKey}_${methodKey}`;
      },
    });

    // Personalizar el documento generado
    this.customizeDocument(document);

    SwaggerModule.setup('api/approval/docs', app, document, {
      explorer: true,
      swaggerOptions: {
        filter: true,
        showRequestDuration: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: true,
        displayRequestDuration: true,
        maxDisplayedTags: 10,
        showExtensions: true,
        showCommonExtensions: true,
        useUnsafeMarkdown: false,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        syntaxHighlight: {
          activate: true,
          theme: 'agate',
        },
        layout: 'BaseLayout',
        deepLinking: true,
        persistAuthorization: true,
      },
      customSiteTitle: 'Motor de Reglas de Aprobación - API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
      ],
      customCssUrl: ['https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css'],
    });
  }

  /**
   * Personaliza el documento de Swagger generado
   */
  private static customizeDocument(document: OpenAPIObject): void {
    // Agregar ejemplos personalizados
    if (!document.components) {
      document.components = {};
    }
    if (!document.components.examples) {
      document.components.examples = {};
    }
    document.components.examples = {
      EvaluationSuccess: {
        summary: 'Evaluación exitosa',
        description: 'Ejemplo de una evaluación aprobada',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: 1,
          chapterId: 3,
          score: 85,
          status: 'approved',
          feedback: 'Excelente trabajo en este capítulo',
          errors: [],
          evaluatedAt: '2024-01-15T10:30:00Z',
          nextAttemptAllowed: true,
          remainingAttempts: 2,
        },
      },
      EvaluationFailure: {
        summary: 'Evaluación fallida',
        description: 'Ejemplo de una evaluación rechazada',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          userId: 1,
          chapterId: 4,
          score: 75,
          status: 'rejected',
          feedback: 'Necesitas mejorar en las siguientes áreas',
          errors: [
            {
              type: 'grammar',
              description: 'Error en tiempo verbal',
              severity: 'high',
            },
          ],
          evaluatedAt: '2024-01-15T10:30:00Z',
          nextAttemptAllowed: true,
          remainingAttempts: 1,
        },
      },
      ApprovalRule: {
        summary: 'Regla de aprobación',
        description: 'Ejemplo de una regla de aprobación configurada',
        value: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          chapterId: 4,
          minScoreThreshold: 100,
          maxAttempts: 3,
          allowErrorCarryover: false,
          isActive: true,
          specialRequirements: {
            requiresPerfectGrammar: true,
            requiresPerfectPronunciation: true,
          },
          description: 'Regla especial para capítulo crítico 4',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      },
    };

    // Agregar esquemas de error personalizados
    if (!document.components.schemas) {
      document.components.schemas = {};
    }
    document.components.schemas.ApprovalError = {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'No se cumplen los requisitos de aprobación',
        },
        error: {
          type: 'string',
          example: 'ApprovalRequirementsNotMetException',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00Z',
        },
        path: {
          type: 'string',
          example: '/api/approval/evaluate',
        },
        details: {
          type: 'object',
          properties: {
            chapterId: {
              type: 'number',
              example: 4,
            },
            requiredScore: {
              type: 'number',
              example: 100,
            },
            actualScore: {
              type: 'number',
              example: 75,
            },
          },
        },
      },
    };

    // Agregar información de seguridad
    if (!document.components.securitySchemes) {
      document.components.securitySchemes = {};
    }
    document.security = [{ 'JWT-auth': [] }];
  }

  /**
   * Obtiene la configuración de tags para organizar los endpoints
   */
  static getTags() {
    return [
      {
        name: 'approval-evaluation',
        description: 'Operaciones para evaluar aprobación de capítulos',
        externalDocs: {
          description: 'Documentación adicional',
          url: 'https://docs.englishapp.com/approval-evaluation',
        },
      },
      {
        name: 'approval-rules',
        description: 'Gestión de reglas de aprobación por capítulo',
        externalDocs: {
          description: 'Documentación adicional',
          url: 'https://docs.englishapp.com/approval-rules',
        },
      },
      {
        name: 'approval-metrics',
        description: 'Métricas y estadísticas de aprobación',
        externalDocs: {
          description: 'Documentación adicional',
          url: 'https://docs.englishapp.com/approval-metrics',
        },
      },
      {
        name: 'approval-history',
        description: 'Historial de evaluaciones de aprobación',
        externalDocs: {
          description: 'Documentación adicional',
          url: 'https://docs.englishapp.com/approval-history',
        },
      },
    ];
  }
}
