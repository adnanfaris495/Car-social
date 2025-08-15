import { toast } from 'sonner'

export interface AppError {
  message: string
  code?: string
  details?: string
  hint?: string
}

export class ErrorHandler {
  static handle(error: any, context?: string): AppError {
    console.error(`Error in ${context || 'unknown context'}:`, error)

    // Handle Supabase errors
    if (error?.code) {
      return this.handleSupabaseError(error)
    }

    // Handle network errors
    if (error?.message?.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      }
    }

    // Handle authentication errors
    if (error?.message?.includes('auth') || error?.message?.includes('login')) {
      return {
        message: 'Authentication error. Please sign in again.',
        code: 'AUTH_ERROR'
      }
    }

    // Handle validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        message: error.message || 'Invalid data provided.',
        code: 'VALIDATION_ERROR'
      }
    }

    // Handle file upload errors
    if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      return {
        message: 'File upload failed. Please try again with a smaller file.',
        code: 'UPLOAD_ERROR'
      }
    }

    // Default error
    return {
      message: error?.message || 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR'
    }
  }

  private static handleSupabaseError(error: any): AppError {
    const { code, message, details, hint } = error

    switch (code) {
      case 'PGRST116':
        return {
          message: 'The requested resource was not found.',
          code: 'NOT_FOUND',
          details,
          hint
        }

      case 'PGRST301':
        return {
          message: 'You are not authorized to perform this action.',
          code: 'UNAUTHORIZED',
          details,
          hint
        }

      case 'PGRST302':
        return {
          message: 'Access denied. Please check your permissions.',
          code: 'FORBIDDEN',
          details,
          hint
        }

      case '23505': // Unique constraint violation
        return {
          message: 'This item already exists.',
          code: 'DUPLICATE',
          details,
          hint
        }

      case '23503': // Foreign key violation
        return {
          message: 'Cannot delete this item as it is referenced by other data.',
          code: 'FOREIGN_KEY_VIOLATION',
          details,
          hint
        }

      case '42P01': // Undefined table
        return {
          message: 'Database configuration error. Please contact support.',
          code: 'DATABASE_ERROR',
          details,
          hint
        }

      case '42703': // Undefined column
        return {
          message: 'Database schema error. Please contact support.',
          code: 'SCHEMA_ERROR',
          details,
          hint
        }

      default:
        return {
          message: message || 'Database error occurred.',
          code: code || 'DATABASE_ERROR',
          details,
          hint
        }
    }
  }

  static showToast(error: AppError, context?: string) {
    const prefix = context ? `[${context}] ` : ''
    toast.error(`${prefix}${error.message}`)
  }

  static showSuccess(message: string, context?: string) {
    const prefix = context ? `[${context}] ` : ''
    toast.success(`${prefix}${message}`)
  }

  static showWarning(message: string, context?: string) {
    const prefix = context ? `[${context}] ` : ''
    toast.warning(`${prefix}${message}`)
  }

  static showInfo(message: string, context?: string) {
    const prefix = context ? `[${context}] ` : ''
    toast.info(`${prefix}${message}`)
  }
}

// Convenience functions for common operations
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    const appError = ErrorHandler.handle(error, context)
    ErrorHandler.showToast(appError, context)
    throw appError
  }
}

export const handleAsyncSuccess = async <T>(
  operation: () => Promise<T>,
  successMessage: string,
  context?: string
): Promise<T> => {
  try {
    const result = await operation()
    ErrorHandler.showSuccess(successMessage, context)
    return result
  } catch (error) {
    const appError = ErrorHandler.handle(error, context)
    ErrorHandler.showToast(appError, context)
    throw appError
  }
} 