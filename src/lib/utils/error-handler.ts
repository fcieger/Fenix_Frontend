import { toast } from 'sonner';

/**
 * Parse validation errors from backend
 * Returns array of error objects with path and message
 */
export function parseValidationErrors(error: any): Array<{ path: string[]; message: string; code?: string }> {
  if (!error) return [];

  // If error has a message property
  if (error.message && typeof error.message === 'string') {
    try {
      // Try to parse as JSON (backend might return array of errors)
      const errorData = JSON.parse(error.message);

      if (Array.isArray(errorData)) {
        return errorData.map((err: any) => ({
          path: Array.isArray(err.path) ? err.path : (err.path ? [err.path] : []),
          message: err.message || err.code || 'Erro de validação',
          code: err.code,
        }));
      }
    } catch {
      // Not JSON, return empty array
    }
  }

  return [];
}

/**
 * Map backend field paths to form field names
 * Converts paths like ['addresses', 0, 'isPrimary'] to form field names
 */
export function mapErrorPathToFieldName(path: string[]): string | null {
  if (path.length === 0) return null;

  const firstPart = path[0];

  // Map common SDK field names to form field names
  const fieldMap: Record<string, string> = {
    'legalName': 'nomeRazaoSocial',
    'tradeName': 'nomeFantasia',
    'taxId': 'taxId', // Will be mapped to cpf or cnpj based on formData
    'personType': 'tipoPessoa',
    'type': 'tiposCliente',
    'stateRegistration': 'ie',
    'municipalRegistration': 'im',
    'simplifiedTaxSystem': 'optanteSimples',
    'notes': 'observacoes',
    'addresses': 'enderecos',
    'contacts': 'contatos',
  };

  // Handle nested paths like addresses[0].isPrimary
  if (firstPart === 'addresses' && path.length > 1) {
    const index = typeof path[1] === 'number' ? path[1] : parseInt(path[1]);
    const field = path[2];
    if (field === 'isPrimary' || field === 'principal') {
      return `enderecos.${index}.principal`;
    }
    // Map other address fields
    const addressFieldMap: Record<string, string> = {
      'street': 'logradouro',
      'number': 'numero',
      'neighborhood': 'bairro',
      'city': 'cidade',
      'state': 'estado',
      'zipCode': 'cep',
    };
    if (addressFieldMap[field]) {
      return `enderecos.${index}.${addressFieldMap[field]}`;
    }
  }

  if (firstPart === 'contacts' && path.length > 1) {
    const index = typeof path[1] === 'number' ? path[1] : parseInt(path[1]);
    const field = path[2];
    if (field === 'isPrimary' || field === 'principal') {
      return `contatos.${index}.principal`;
    }
    // Map other contact fields
    const contactFieldMap: Record<string, string> = {
      'name': 'pessoaContato',
      'position': 'cargo',
      'phone': 'telefoneComercial',
      'email': 'email',
    };
    if (contactFieldMap[field]) {
      return `contatos.${index}.${contactFieldMap[field]}`;
    }
  }

  return fieldMap[firstPart] || firstPart;
}

/**
 * Handle validation errors from backend
 * Parses error messages and shows user-friendly toast notifications
 * Returns field errors map for highlighting fields
 */
export function handleValidationError(error: any, setFieldErrors?: (errors: Record<string, boolean>) => void): Record<string, boolean> {
  console.error('Validation error:', error);

  const fieldErrors: Record<string, boolean> = {};

  if (!error) {
    toast.error('Erro', 'Ocorreu um erro desconhecido');
    return fieldErrors;
  }

  // Parse validation errors
  const validationErrors = parseValidationErrors(error);

  if (validationErrors.length > 0) {
    // Multiple validation errors
    const errorMessages = validationErrors.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });

    toast.error(
      'Erro de Validação',
      `Por favor, corrija os seguintes campos:\n${errorMessages.join('\n')}`,
      { duration: 10000 }
    );

    // Map errors to field names and mark fields with errors
    validationErrors.forEach((err) => {
      const fieldName = mapErrorPathToFieldName(err.path);
      if (fieldName) {
        // Handle nested field names like 'enderecos.0.principal'
        if (fieldName.includes('.')) {
          const parts = fieldName.split('.');
          if (parts[0] === 'enderecos' || parts[0] === 'contatos') {
            // Mark the parent field as having errors
            fieldErrors[parts[0]] = true;
          }
          // Also mark the specific nested field
          fieldErrors[fieldName] = true;
        } else {
          fieldErrors[fieldName] = true;
        }
      }
    });
  } else {
    // Single error or non-validation error
    if (error.message && typeof error.message === 'string') {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.message) {
          toast.error('Erro', errorData.message);
        } else {
          toast.error('Erro', error.message);
        }
      } catch {
        toast.error('Erro', error.message);
      }
    } else if (typeof error === 'string') {
      toast.error('Erro', error);
    } else {
      toast.error('Erro', 'Ocorreu um erro ao processar a solicitação');
    }
  }

  // Update field errors state if setter provided
  if (setFieldErrors) {
    setFieldErrors(fieldErrors);
  }

  return fieldErrors;
}

