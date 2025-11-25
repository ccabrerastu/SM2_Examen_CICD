import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validador personalizado para verificar que el score esté en el rango válido (0-100)
 */
export function IsValidScore(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidScore',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown) {
          return typeof value === 'number' && value >= 0 && value <= 100;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a number between 0 and 100`;
        },
      },
    });
  };
}

/**
 * Validador personalizado para verificar que el threshold sea válido según el capítulo
 */
export function IsValidThreshold(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidThreshold',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const chapterId = obj.chapterId;

          if (typeof value !== 'number' || value < 0 || value > 100) {
            return false;
          }

          // Capítulos 4 y 5 requieren 100%
          if ((chapterId === 4 || chapterId === 5) && value !== 100) {
            return false;
          }

          // Otros capítulos pueden tener threshold entre 50-100
          if (chapterId !== 4 && chapterId !== 5 && (value < 50 || value > 100)) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const chapterId = obj.chapterId;

          if (chapterId === 4 || chapterId === 5) {
            return `Chapters 4 and 5 require a threshold of exactly 100%`;
          }

          return `${args.property} must be between 50 and 100 for regular chapters`;
        },
      },
    });
  };
}

/**
 * Validador personalizado para verificar que el capítulo ID sea válido
 */
export function IsValidChapterId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidChapterId',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown) {
          if (typeof value === 'string') {
            const numValue = parseInt(value, 10);
            return !isNaN(numValue) && numValue >= 1 && numValue <= 20;
          }
          return typeof value === 'number' && value >= 1 && value <= 20;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid chapter number between 1 and 20`;
        },
      },
    });
  };
}

/**
 * Validador personalizado para verificar que el número de intentos sea válido
 */
export function IsValidAttemptCount(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidAttemptCount',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown) {
          return typeof value === 'number' && value >= 1 && value <= 10; // Máximo 10 intentos
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be between 1 and 10 attempts`;
        },
      },
    });
  };
}

/**
 * Validador personalizado para verificar que los errores sean válidos
 */
export function IsValidErrorArray(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidErrorArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown) {
          if (!Array.isArray(value)) {
            return false;
          }

          return value.every((error: unknown) => {
            if (typeof error !== 'object' || error === null) {
              return false;
            }

            const errorObj = error as Record<string, unknown>;

            return (
              'type' in errorObj &&
              'description' in errorObj &&
              typeof errorObj.type === 'string' &&
              typeof errorObj.description === 'string' &&
              (!('weight' in errorObj) ||
                (typeof errorObj.weight === 'number' &&
                  errorObj.weight >= 0 &&
                  errorObj.weight <= 1))
            );
          });
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of valid error objects with type, description, and optional weight (0-1)`;
        },
      },
    });
  };
}

/**
 * Validador personalizado para verificar que el tipo de evaluación sea válido
 */
export function IsValidEvaluationType(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidEvaluationType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: unknown) {
          const validTypes = ['AUTOMATIC', 'MANUAL', 'HYBRID'];
          return typeof value === 'string' && validTypes.includes(value.toUpperCase());
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be one of: AUTOMATIC, MANUAL, or HYBRID`;
        },
      },
    });
  };
}
