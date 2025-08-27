export interface ErrorResponse {
  status: number;
  body: {
    error: string;
    code: string;
    details?: any;
    requestId?: string;
  };
}

export class ErrorHandler {
  private static readonly ERROR_MAPPINGS = new Map([
    ['VALIDATION_ERROR', { status: 400, code: 'VALIDATION_ERROR' }],
    ['STORY_NOT_FOUND', { status: 404, code: 'NOT_FOUND' }],
    ['UNAUTHORIZED', { status: 401, code: 'UNAUTHORIZED' }],
    ['MISSING_API_KEYS', { status: 500, code: 'SERVICE_UNAVAILABLE' }],
    ['AI_GENERATION_FAILED', { status: 503, code: 'AI_UNAVAILABLE' }],
    ['DATABASE_ERROR', { status: 500, code: 'DATABASE_ERROR' }],
    ['RATE_LIMIT_EXCEEDED', { status: 429, code: 'RATE_LIMIT' }],
  ]);
  
  static handleError(error: any): ErrorResponse {
    // Custom error with status and code
    if (error.status && error.code) {
      return {
        status: error.status,
        body: {
          error: error.message || 'An error occurred',
          code: error.code,
          details: error.details,
          requestId: error.requestId
        }
      };
    }
    
    // Check for known error types
    for (const [key, mapping] of this.ERROR_MAPPINGS.entries()) {
      if (error.message?.includes(key) || error.code === key) {
        return {
          status: mapping.status,
          body: {
            error: error.message || 'An error occurred',
            code: mapping.code,
            details: error.details
          }
        };
      }
    }
    
    // Handle specific error patterns
    if (error.message?.includes('not found')) {
      return {
        status: 404,
        body: {
          error: error.message,
          code: 'NOT_FOUND'
        }
      };
    }
    
    if (error.message?.includes('unauthorized') || error.message?.includes('authentication')) {
      return {
        status: 401,
        body: {
          error: error.message,
          code: 'UNAUTHORIZED'
        }
      };
    }
    
    // Default error response
    return {
      status: 500,
      body: {
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
  }
  
  static createError(message: string, code: string, status: number, details?: any): Error {
    const error = new Error(message) as any;
    error.code = code;
    error.status = status;
    error.details = details;
    return error;
  }
}