import { z } from 'zod';
import { toast } from 'sonner';

/**
 * Validation helper functions using Zod schemas from SDK
 */

/**
 * Validate data against a Zod schema and return formatted errors
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with isValid boolean and fieldErrors map
 */
export function validateWithSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { isValid: boolean; fieldErrors: Record<string, boolean>; errors: z.ZodError | null } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { isValid: true, fieldErrors: {}, errors: null };
  }

  const fieldErrors: Record<string, boolean> = {};

  result.error.errors.forEach((error) => {
    const path = error.path.join('.');
    fieldErrors[path] = true;

    // Also mark parent paths for nested errors
    if (path.includes('.')) {
      const parts = path.split('.');
      for (let i = 1; i < parts.length; i++) {
        const parentPath = parts.slice(0, i).join('.');
        fieldErrors[parentPath] = true;
      }
    }
  });

  return { isValid: false, fieldErrors, errors: result.error };
}

/**
 * Validate data and show toast notification on error
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param setFieldErrors - Optional function to set field errors state
 * @returns Object with isValid boolean and fieldErrors map
 */
export function validateAndNotify<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  setFieldErrors?: (errors: Record<string, boolean>) => void
): { isValid: boolean; fieldErrors: Record<string, boolean> } {
  const { isValid, fieldErrors, errors } = validateWithSchema(schema, data);

  if (!isValid && errors) {
    const errorMessages = errors.errors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });

    toast.error(
      'Erro de Validação',
      `Por favor, corrija os seguintes campos:\n${errorMessages.join('\n')}`,
      { duration: 10000 }
    );

    if (setFieldErrors) {
      setFieldErrors(fieldErrors);
    }
  }

  return { isValid, fieldErrors };
}

