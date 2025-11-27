// ApiError type from SDK - using dynamic import to handle package name variations
type ApiError = {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * User-friendly error messages mapping
 */
const ERROR_MESSAGES: Record<number, string> = {
  400: "Invalid request data. Please check your input and try again.",
  401: "Authentication required. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "A conflict occurred. This resource may already exist.",
  422: "Validation error. Please check the form fields.",
  500: "An internal server error occurred. Please try again later.",
  503: "Service temporarily unavailable. Please try again later.",
};

/**
 * Error handler utility for SDK ApiError
 */
export class SdkErrorHandler {
  /**
   * Check if error is an ApiError instance
   */
  private static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      "message" in error
    );
  }

  /**
   * Handle an error and return a user-friendly message
   */
  static handleError(error: unknown): {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
  } {
    if (this.isApiError(error)) {
      return {
        message: this.getUserFriendlyMessage(error),
        statusCode: error.statusCode,
        errors: error.errors,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message || "An unexpected error occurred",
      };
    }

    return {
      message: "An unexpected error occurred",
    };
  }

  /**
   * Get user-friendly error message from ApiError
   */
  private static getUserFriendlyMessage(error: ApiError): string {
    // If there are validation errors, format them nicely
    if (error.errors && Object.keys(error.errors).length > 0) {
      const errorMessages = Object.values(error.errors).flat();
      if (errorMessages.length === 1) {
        return errorMessages[0];
      }
      return `Validation errors: ${errorMessages.join(", ")}`;
    }

    // Use predefined messages for common status codes
    if (error.statusCode in ERROR_MESSAGES) {
      return ERROR_MESSAGES[error.statusCode];
    }

    // Fallback to error message or default
    return error.message || "An error occurred";
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    return this.isApiError(error) && error.statusCode === 401;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    return (
      this.isApiError(error) &&
      (error.statusCode === 400 || error.statusCode === 422)
    );
  }

  /**
   * Check if error is a conflict error
   */
  static isConflictError(error: unknown): boolean {
    return this.isApiError(error) && error.statusCode === 409;
  }

  /**
   * Check if error is a not found error
   */
  static isNotFoundError(error: unknown): boolean {
    return this.isApiError(error) && error.statusCode === 404;
  }

  /**
   * Format validation errors for display
   */
  static formatValidationErrors(errors?: Record<string, string[]>): string[] {
    if (!errors) return [];

    return Object.entries(errors).flatMap(([field, messages]) =>
      messages.map((msg) => `${field}: ${msg}`)
    );
  }
}
