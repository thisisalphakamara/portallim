export interface ApiError {
  success: false;
  error: string;
  stack?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ErrorUtils {
  static extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.error) {
      return error.error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.response?.data?.error) {
      return error.response.data.error;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Handle validation errors
    if (error?.response?.data?.details) {
      const details = error.response.data.details;
      if (Array.isArray(details)) {
        return details.join(', ');
      }
      if (typeof details === 'string') {
        return details;
      }
    }
    
    // Network errors
    if (error?.code === 'ECONNREFUSED') {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error?.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your internet connection and try again.';
    }
    
    // Timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    
    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'ECONNREFUSED' || 
           error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('Network Error') ||
           !navigator.onLine;
  }

  static isAuthError(error: any): boolean {
    const status = error?.response?.status || error?.status;
    return status === 401 || status === 403;
  }

  static isValidationError(error: any): boolean {
    const status = error?.response?.status || error?.status;
    return status === 400;
  }

  static isServerError(error: any): boolean {
    const status = error?.response?.status || error?.status;
    return status >= 500;
  }

  static getErrorType(error: any): 'network' | 'auth' | 'validation' | 'server' | 'unknown' {
    if (this.isNetworkError(error)) return 'network';
    if (this.isAuthError(error)) return 'auth';
    if (this.isValidationError(error)) return 'validation';
    if (this.isServerError(error)) return 'server';
    return 'unknown';
  }

  static getErrorAction(error: any): string {
    const type = this.getErrorType(error);
    
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'auth':
        return 'Please log in again to continue.';
      case 'validation':
        return 'Please check your input and try again.';
      case 'server':
        return 'Server error occurred. Please try again later.';
      default:
        return 'Please try again or contact support if the problem persists.';
    }
  }
}
