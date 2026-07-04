import * as TOML from '@iarna/toml';
import { ProcessingResult, TomlSettings } from '../types/formatters';
import { 
  createProcessingResult, 
  createFormatError, 
  parseErrorWithLocation,
  calculateSizeMetrics,
  withErrorHandling 
} from './errorHandling';

/**
 * Default TOML processing settings
 */
export const defaultTomlSettings: TomlSettings = {
  indentSize: 2,
  preserveComments: true,
  sortKeys: false,
  convertToJson: false,
};

/**
 * Validates TOML syntax
 */
export function validateToml(tomlContent: string): { isValid: boolean; error?: string } {
  try {
    TOML.parse(tomlContent);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid TOML syntax' 
    };
  }
}

/**
 * Parses TOML content into a JavaScript object
 */
export function parseToml(tomlContent: string): any {
  try {
    return TOML.parse(tomlContent);
  } catch (error) {
    throw new Error(`TOML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts JavaScript object to TOML string
 */
export function stringifyToml(obj: any, settings: TomlSettings): string {
  try {
    return TOML.stringify(obj);
  } catch (error) {
    throw new Error(`TOML stringification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Sorts object keys recursively
 */
export function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  
  return sorted;
}

/**
 * Formats TOML with proper spacing and organization
 */
export function formatToml(tomlContent: string, settings: TomlSettings): string {
  try {
    let parsed = parseToml(tomlContent);
    
    if (settings.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    
    let formatted = stringifyToml(parsed, settings);
    
    // Apply custom formatting based on settings
    if (settings.indentSize !== 2) {
      // TOML.stringify doesn't support custom indentation, so we'll do basic formatting
      formatted = formatted.replace(/^(\s*)/gm, (match) => {
        const depth = match.length / 2;
        return ' '.repeat(depth * settings.indentSize);
      });
    }
    
    return formatted;
  } catch (error) {
    throw new Error(`TOML formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Converts TOML to JSON
 */
export function tomlToJson(tomlContent: string, settings: TomlSettings): string {
  try {
    let parsed = parseToml(tomlContent);
    
    if (settings.sortKeys) {
      parsed = sortObjectKeys(parsed);
    }
    
    return JSON.stringify(parsed, null, settings.indentSize);
  } catch (error) {
    throw new Error(`TOML to JSON conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyzes TOML structure
 */
export function analyzeTomlStructure(tomlContent: string) {
  try {
    const parsed = parseToml(tomlContent);
    
    function countElements(obj: any, depth = 0): { 
      tables: number; 
      keys: number; 
      arrays: number; 
      maxDepth: number 
    } {
      let tables = 0;
      let keys = 0;
      let arrays = 0;
      let maxDepth = depth;
      
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          arrays++;
          for (const item of obj) {
            const childResult = countElements(item, depth + 1);
            tables += childResult.tables;
            keys += childResult.keys;
            arrays += childResult.arrays;
            maxDepth = Math.max(maxDepth, childResult.maxDepth);
          }
        } else {
          for (const key in obj) {
            keys++;
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
              tables++;
            }
            const childResult = countElements(obj[key], depth + 1);
            tables += childResult.tables;
            keys += childResult.keys;
            arrays += childResult.arrays;
            maxDepth = Math.max(maxDepth, childResult.maxDepth);
          }
        }
      }
      
      return { tables, keys, arrays, maxDepth };
    }
    
    const analysis = countElements(parsed);
    
    return {
      format: 'TOML',
      encoding: 'UTF-8',
      lineCount: tomlContent.split('\n').length,
      characterCount: tomlContent.length,
      structure: {
        depth: analysis.maxDepth,
        tables: analysis.tables,
        keys: analysis.keys,
        arrays: analysis.arrays,
      },
    };
  } catch (error) {
    throw new Error(`TOML analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extracts TOML sections/tables
 */
export function extractTomlSections(tomlContent: string): string[] {
  const sections: string[] = [];
  const lines = tomlContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']') && !trimmed.startsWith('[[')) {
      sections.push(trimmed.slice(1, -1));
    }
  }
  
  return sections;
}

/**
 * Extracts TOML array tables
 */
export function extractTomlArrayTables(tomlContent: string): string[] {
  const arrayTables: string[] = [];
  const lines = tomlContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
      arrayTables.push(trimmed.slice(2, -2));
    }
  }
  
  return arrayTables;
}

/**
 * Main TOML processing function
 */
export async function processToml(
  tomlContent: string, 
  settings: TomlSettings
): Promise<ProcessingResult> {
  return withErrorHandling(() => {
    if (!tomlContent.trim()) {
      return createProcessingResult(true, '', []);
    }

    // Validate TOML first
    const validation = validateToml(tomlContent);
    if (!validation.isValid) {
      const error = parseErrorWithLocation(
        validation.error || 'Invalid TOML syntax',
        'TOML validation failed'
      );
      return createProcessingResult(false, '', [error]);
    }

    // Format or convert the TOML
    let output: string;
    if (settings.convertToJson) {
      output = tomlToJson(tomlContent, settings);
    } else {
      output = formatToml(tomlContent, settings);
    }
    
    const metadata = calculateSizeMetrics(tomlContent, output);
    
    return createProcessingResult(true, output, [], metadata);
  }, 'TOML processing');
}

/**
 * Validates TOML key naming conventions
 */
export function validateTomlKeys(tomlContent: string): ProcessingResult {
  try {
    const parsed = parseToml(tomlContent);
    const warnings: any[] = [];
    
    function checkKeys(obj: any, path = ''): void {
      if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        for (const key in obj) {
          const fullPath = path ? `${path}.${key}` : key;
          
          // Check for kebab-case vs snake_case consistency
          if (key.includes('-') && key.includes('_')) {
            warnings.push(createFormatError(
              `Mixed naming convention in key "${fullPath}": contains both hyphens and underscores`,
              undefined,
              undefined,
              'warning'
            ));
          }
          
          // Check for spaces in keys (should be quoted)
          if (key.includes(' ') && !key.startsWith('"')) {
            warnings.push(createFormatError(
              `Key "${fullPath}" contains spaces and should be quoted`,
              undefined,
              undefined,
              'warning'
            ));
          }
          
          checkKeys(obj[key], fullPath);
        }
      }
    }
    
    checkKeys(parsed);
    
    return createProcessingResult(true, 'TOML keys validated', warnings);
  } catch (error) {
    const formatError = createFormatError(
      `Key validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      undefined,
      'error'
    );
    return createProcessingResult(false, '', [formatError]);
  }
}