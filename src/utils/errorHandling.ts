import { FormatError, ValidationResult, ProcessingResult } from '../types/formatters';

/**
 * Creates a standardized format error
 */
export function createFormatError(
  message: string,
  line?: number,
  column?: number,
  severity: 'error' | 'warning' | 'info' = 'error',
  code?: string
): FormatError {
  return {
    message,
    line,
    column,
    severity,
    code,
  };
}

/**
 * Creates a validation result from errors and warnings
 */
export function createValidationResult(
  errors: FormatError[] = [],
  warnings: FormatError[] = []
): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Creates a processing result
 */
export function createProcessingResult(
  success: boolean,
  output: string = '',
  errors: FormatError[] = [],
  metadata?: ProcessingResult['metadata']
): ProcessingResult {
  return {
    success,
    output,
    errors,
    metadata,
  };
}

/**
 * Wraps a processing function with error handling
 */
export function withErrorHandling<T>(
  processingFn: () => T,
  errorContext: string = 'Processing'
): ProcessingResult {
  const startTime = Date.now();
  
  try {
    const result = processingFn();
    const processingTime = Date.now() - startTime;
    
    if (typeof result === 'string') {
      return createProcessingResult(true, result, [], {
        originalSize: 0,
        processedSize: result.length,
        processingTime,
      });
    }
    
    return result as ProcessingResult;
  } catch (error) {
    const processingTime = Date.now() - startTime;
    const formatError = createFormatError(
      `${errorContext}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      undefined,
      'error'
    );
    
    return createProcessingResult(false, '', [formatError], {
      originalSize: 0,
      processedSize: 0,
      processingTime,
    });
  }
}

/**
 * Parses error messages that include line/column information
 */
export function parseErrorWithLocation(
  errorMessage: string,
  defaultMessage: string = 'Parsing error'
): FormatError {
  // Common patterns for line/column errors
  const patterns = [
    /line (\d+)(?:, column (\d+))?/i,
    /at line (\d+)(?:, column (\d+))?/i,
    /\((\d+):(\d+)\)/,
    /\[(\d+),(\d+)\]/,
  ];
  
  for (const pattern of patterns) {
    const match = errorMessage.match(pattern);
    if (match) {
      const line = parseInt(match[1], 10);
      const column = match[2] ? parseInt(match[2], 10) : undefined;
      return createFormatError(errorMessage, line, column);
    }
  }
  
  return createFormatError(errorMessage || defaultMessage);
}

/**
 * Formats error messages for display
 */
export function formatErrorMessage(error: FormatError): string {
  let message = error.message;
  
  if (error.line !== undefined) {
    message += ` (Line ${error.line}`;
    if (error.column !== undefined) {
      message += `, Column ${error.column}`;
    }
    message += ')';
  }
  
  if (error.code) {
    message += ` [${error.code}]`;
  }
  
  return message;
}

/**
 * Groups errors by severity
 */
export function groupErrorsBySeverity(errors: FormatError[]): {
  errors: FormatError[];
  warnings: FormatError[];
  info: FormatError[];
} {
  return {
    errors: errors.filter(e => e.severity === 'error'),
    warnings: errors.filter(e => e.severity === 'warning'),
    info: errors.filter(e => e.severity === 'info'),
  };
}

/**
 * Calculates file size metrics
 */
export function calculateSizeMetrics(
  originalContent: string,
  processedContent: string
): ProcessingResult['metadata'] {
  const originalSize = new Blob([originalContent]).size;
  const processedSize = new Blob([processedContent]).size;
  const compressionRatio = originalSize > 0 ? (originalSize - processedSize) / originalSize : 0;
  
  return {
    originalSize,
    processedSize,
    compressionRatio,
    processingTime: 0, // Will be set by the calling function
  };
}