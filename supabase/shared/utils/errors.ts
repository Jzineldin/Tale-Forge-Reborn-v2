// Shared Error Handling for all Supabase Edge Functions
// Standardizes error responses and logging across 18+ functions

import { createCorsErrorResponse } from './cors.ts';

/**
 * Standard error codes used across all functions
 */
export enum ErrorCodes {
  // Authentication errors
  MISSING_AUTH = 'MISSING_AUTH',
  INVALID_TOKEN = 'INVALID_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_VALUE = 'INVALID_FIELD_VALUE',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_FORBIDDEN = 'RESOURCE_FORBIDDEN',
  
  // Service errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Environment errors
  MISSING_CONFIG = 'MISSING_CONFIG',
  INVALID_CONFIG = 'INVALID_CONFIG'
}

/**
 * Standard error interface for all functions
 */
export interface StandardError {
  code: ErrorCodes;
  message: string;
  details?: any;
  timestamp: string;
  function?: string;
  requestId?: string;
}

/**
 * Create standardized error object
 */
export function createStandardError(
  code: ErrorCodes,
  message: string,
  details?: any,
  functionName?: string
): StandardError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    function: functionName,
    requestId: crypto.randomUUID?.() || `req_${Date.now()}`
  };
}

/**
 * Handle and format errors with proper logging
 * Centralized error processing for all functions
 */
export function handleFunctionError(
  error: any,
  functionName: string,
  context?: Record<string, any>
): Response {
  
  // Log error with context
  console.error(`❌ [${functionName}] Error:`, {
    error: {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500),
      code: error.code
    },
    context,
    timestamp: new Date().toISOString()
  });
  
  // Handle known error types
  if (error.code && Object.values(ErrorCodes).includes(error.code)) {
    return createCorsErrorResponse(error.message, getHttpStatusForErrorCode(error.code), error.code);
  }
  
  // Handle database errors
  if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
    const standardError = createStandardError(
      ErrorCodes.RESOURCE_CONFLICT,
      'Resource already exists',
      { original: error.message },
      functionName
    );
    return createCorsErrorResponse(standardError, 409, standardError.code);
  }
  
  // Handle not found errors
  if (error.message?.includes('not found') || error.message?.includes('No rows')) {
    const standardError = createStandardError(
      ErrorCodes.RESOURCE_NOT_FOUND,
      'Resource not found',
      { original: error.message },
      functionName
    );
    return createCorsErrorResponse(standardError, 404, standardError.code);
  }
  
  // Handle timeout errors
  if (error.message?.includes('timeout') || error.name === 'TimeoutError') {
    const standardError = createStandardError(
      ErrorCodes.TIMEOUT_ERROR,
      'Request timeout',
      { original: error.message },
      functionName
    );
    return createCorsErrorResponse(standardError, 408, standardError.code);
  }
  
  // Handle AI service errors
  if (error.message?.includes('AI') || error.message?.includes('OpenAI') || error.message?.includes('OVH')) {
    const standardError = createStandardError(
      ErrorCodes.AI_SERVICE_ERROR,
      'AI service error',
      { original: error.message },
      functionName
    );
    return createCorsErrorResponse(standardError, 502, standardError.code);
  }
  
  // Generic internal error
  const standardError = createStandardError(
    ErrorCodes.INTERNAL_ERROR,
    'Internal server error',
    { 
      original: error.message,
      type: error.name 
    },
    functionName
  );
  
  return createCorsErrorResponse(standardError, 500, standardError.code);
}

/**
 * Get appropriate HTTP status code for error code
 */
function getHttpStatusForErrorCode(code: ErrorCodes): number {
  switch (code) {
    case ErrorCodes.MISSING_AUTH:
    case ErrorCodes.INVALID_TOKEN:
      return 401;
      
    case ErrorCodes.INSUFFICIENT_PERMISSIONS:
    case ErrorCodes.RESOURCE_FORBIDDEN:
      return 403;
      
    case ErrorCodes.RESOURCE_NOT_FOUND:
      return 404;
      
    case ErrorCodes.TIMEOUT_ERROR:
      return 408;
      
    case ErrorCodes.RESOURCE_CONFLICT:
      return 409;
      
    case ErrorCodes.INVALID_REQUEST:
    case ErrorCodes.MISSING_REQUIRED_FIELD:
    case ErrorCodes.INVALID_FIELD_VALUE:
      return 400;
      
    case ErrorCodes.SERVICE_UNAVAILABLE:
      return 503;
      
    case ErrorCodes.EXTERNAL_SERVICE_ERROR:
    case ErrorCodes.AI_SERVICE_ERROR:
      return 502;
      
    case ErrorCodes.MISSING_CONFIG:
    case ErrorCodes.INVALID_CONFIG:
    case ErrorCodes.DATABASE_ERROR:
    case ErrorCodes.INTERNAL_ERROR:
    default:
      return 500;
  }
}

/**
 * Validation error helper
 * Quick way to create validation errors
 */
export function createValidationError(message: string, field?: string): StandardError {
  return createStandardError(
    ErrorCodes.INVALID_FIELD_VALUE,
    message,
    field ? { field } : undefined
  );
}

/**
 * Authentication error helper
 * Quick way to create auth errors
 */
export function createAuthError(message: string): StandardError {
  return createStandardError(ErrorCodes.MISSING_AUTH, message);
}

/**
 * Not found error helper
 * Quick way to create not found errors
 */
export function createNotFoundError(resource: string, id?: string): StandardError {
  return createStandardError(
    ErrorCodes.RESOURCE_NOT_FOUND,
    `${resource} not found`,
    id ? { id } : undefined
  );
}

/**
 * Service error helper
 * Quick way to create service errors
 */
export function createServiceError(service: string, message: string, details?: any): StandardError {
  return createStandardError(
    ErrorCodes.EXTERNAL_SERVICE_ERROR,
    `${service} service error: ${message}`,
    details
  );
}

/**
 * Try-catch wrapper for async functions
 * Automatically handles errors with proper logging
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  functionName: string,
  context?: Record<string, any>
): Promise<{ success: true; data: T } | { success: false; error: Response }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: handleFunctionError(error, functionName, context) 
    };
  }
}

/**
 * Validate required fields helper
 * Common validation pattern across functions
 */
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): StandardError[] {
  const errors: StandardError[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors.push(createValidationError(`${field} is required`, field));
    }
  }
  
  return errors;
}

/**
 * Rate limiting error
 * For future implementation of rate limiting
 */
export function createRateLimitError(limit: number, window: string): StandardError {
  return createStandardError(
    ErrorCodes.SERVICE_UNAVAILABLE,
    `Rate limit exceeded. Maximum ${limit} requests per ${window}`,
    { limit, window }
  );
}