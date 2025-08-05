import { SecretValueType, SecretAnalysis, SecretKeyValue, ParsedSecretData } from './types';

/**
 * Utility functions for Kubernetes Secret operations
 */

/**
 * Checks if a string is valid base64
 */
export function isValidBase64(str: string): boolean {
  if (str === '') return false;
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

/**
 * Safely decodes base64 string
 */
export function safeBase64Decode(str: string): string {
  try {
    return atob(str);
  } catch {
    return '[Invalid Base64]';
  }
}

/**
 * Safely encodes string to base64
 */
export function safeBase64Encode(str: string): string {
  try {
    return btoa(str);
  } catch {
    return '';
  }
}

/**
 * Detects the type of secret value based on content
 */
export function detectSecretValueType(value: string): SecretValueType {
  // URL detection
  if (/^https?:\/\//.test(value) || /^[a-z]+:\/\//.test(value)) {
    return 'url';
  }

  // Email detection
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    return 'email';
  }

  // Certificate detection
  if (value.includes('-----BEGIN CERTIFICATE-----') || value.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    return 'certificate';
  }

  // JSON detection
  if (value.trim().startsWith('{') && value.trim().endsWith('}')) {
    try {
      JSON.parse(value);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  // YAML detection
  if (value.includes('\n') && (value.includes(':') || value.includes('-'))) {
    return 'yaml';
  }

  // XML detection
  if (value.trim().startsWith('<') && value.trim().endsWith('>')) {
    return 'xml';
  }

  // Token detection (common patterns) - check before binary
  // OpenAI API key
  if (value.startsWith('sk-') && /^sk-[a-zA-Z0-9]{32,}$/.test(value)) return 'token';
  // GitHub token
  if ((value.startsWith('ghp_') || value.startsWith('gho_')) && value.length > 20) return 'token';
  // AWS access key
  if (value.startsWith('AKIA') && value.length === 20 && /^[A-Z0-9]+$/.test(value)) return 'token';
  
  // Binary detection (non-printable characters)
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(value)) {
    return 'binary';
  }

  // General high-entropy string
  if (/^[a-zA-Z0-9_-]{30,}$/.test(value) && calculateEntropy(value) === 'high') return 'token';

  // Password detection (heuristic)
  if (value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value)) {
    return 'password';
  }

  return 'text';
}

/**
 * Calculates entropy level of a string
 */
export function calculateEntropy(str: string): 'low' | 'medium' | 'high' {
  if (str.length === 0) return 'low';
  
  const uniqueChars = new Set(str).size;
  const ratio = uniqueChars / str.length;
  
  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.3) return 'medium';
  return 'low';
}

/**
 * Analyzes a secret value for security concerns
 */
export function analyzeSecretValue(key: string, value: string): SecretAnalysis {
  // Check if it's a known token pattern before base64 decoding
  const directType = detectSecretValueType(value);
  
  const isBase64 = isValidBase64(value);
  const decodedValue = isBase64 ? safeBase64Decode(value) : value;
  
  // Use direct detection for tokens, otherwise use decoded detection
  const detectedType = directType === 'token' ? directType : detectSecretValueType(decodedValue);
  const entropy = calculateEntropy(decodedValue);
  
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check for common security issues
  const checkValue = directType === 'token' ? value : decodedValue;
  
  if (detectedType === 'url' && (checkValue.includes('://') && checkValue.includes('@'))) {
    warnings.push('URL contains embedded credentials');
    suggestions.push('Consider using separate username/password fields');
  }

  if (detectedType === 'token') {
    if (checkValue.startsWith('sk-')) {
      warnings.push('Appears to be an OpenAI API key');
    } else if (checkValue.startsWith('ghp_')) {
      warnings.push('Appears to be a GitHub personal access token');
    } else if (checkValue.startsWith('AKIA')) {
      warnings.push('Appears to be an AWS access key');
    }
  }

  if (entropy === 'low' && detectedType === 'password') {
    warnings.push('Password has low entropy - consider using a stronger password');
  }

  if (key.toLowerCase().includes('password') && !isBase64) {
    warnings.push('Password stored in plaintext - should be base64 encoded');
  }

  return {
    isValidBase64: isBase64,
    detectedType,
    hasCredentials: detectedType === 'url' && decodedValue.includes('@'),
    entropy,
    warnings,
    suggestions
  };
}

/**
 * Parses a Kubernetes Secret YAML and extracts structured data
 */
export function parseKubernetesSecret(yamlContent: string): ParsedSecretData {
  try {
    // Simple YAML parsing for Secret structure
    const lines = yamlContent.split('\n');
    let secretName = '';
    let secretNamespace = 'default';
    let secretType = 'Opaque';
    let currentSection = '';
    const dataSection: Record<string, string> = {};
    const stringDataSection: Record<string, string> = {};

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('name:')) {
        secretName = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.startsWith('namespace:')) {
        secretNamespace = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine.startsWith('type:')) {
        secretType = trimmedLine.split(':')[1].trim();
      } else if (trimmedLine === 'data:') {
        currentSection = 'data';
      } else if (trimmedLine === 'stringData:') {
        currentSection = 'stringData';
      } else if (trimmedLine.includes(':') && currentSection) {
        const [key, ...valueParts] = trimmedLine.split(':');
        const value = valueParts.join(':').trim();
        
        if (currentSection === 'data') {
          dataSection[key.trim()] = value;
        } else if (currentSection === 'stringData') {
          stringDataSection[key.trim()] = value;
        }
      }
    }

    const keys: SecretKeyValue[] = [];
    const securityWarnings: string[] = [];
    const suggestions: string[] = [];

    // Process data section (base64 encoded)
    Object.entries(dataSection).forEach(([key, value]) => {
      const analysis = analyzeSecretValue(key, value);
      keys.push({
        key,
        value,
        encoding: 'base64',
        type: analysis.detectedType,
        include: true
      });
      securityWarnings.push(...analysis.warnings);
      suggestions.push(...analysis.suggestions);
    });

    // Process stringData section (plain text)
    Object.entries(stringDataSection).forEach(([key, value]) => {
      const analysis = analyzeSecretValue(key, value);
      keys.push({
        key,
        value,
        encoding: 'string',
        type: analysis.detectedType,
        include: true
      });
      securityWarnings.push(...analysis.warnings);
      suggestions.push(...analysis.suggestions);
    });

    return {
      keys,
      metadata: {
        name: secretName || 'unnamed-secret',
        namespace: secretNamespace,
        type: secretType
      },
      analysis: {
        totalKeys: keys.length,
        securityWarnings: [...new Set(securityWarnings)],
        suggestions: [...new Set(suggestions)]
      }
    };
  } catch (error) {
    throw new Error(`Failed to parse Kubernetes Secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a preview of a secret value (truncated with asterisks)
 */
export function generateValuePreview(value: string, maxLength: number = 15): string {
  if (value === '') return '';
  
  const isBase64 = isValidBase64(value);
  const displayValue = isBase64 ? safeBase64Decode(value) : value;
  
  if (displayValue === '[Invalid Base64]') {
    return value.substring(0, 3) + '*'.repeat(Math.min(value.length - 3, maxLength - 3));
  }
  
  if (displayValue.length <= maxLength) {
    return displayValue.substring(0, 3) + '*'.repeat(displayValue.length - 3);
  }
  
  return displayValue.substring(0, 3) + '*'.repeat(maxLength - 3);
}

/**
 * Validates Kubernetes Secret YAML structure
 */
export function validateSecretYaml(yamlContent: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!yamlContent.includes('apiVersion: v1')) {
    errors.push('Missing required apiVersion: v1');
  }
  
  if (!yamlContent.includes('kind: Secret')) {
    errors.push('Missing required kind: Secret');
  }
  
  if (!yamlContent.includes('metadata:') || !yamlContent.includes('name:')) {
    errors.push('Missing required metadata.name field');
  }
  
  const hasData = /^data:/m.test(yamlContent);
  const hasStringData = /^stringData:/m.test(yamlContent);
  
  if (!hasData && !hasStringData) {
    errors.push('Secret must have either data or stringData section');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}