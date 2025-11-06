import * as yaml from 'js-yaml';
import DOMPurify from 'dompurify';
import { SecretValueType, SecretAnalysis, SecretKeyValue, ParsedSecretData, KubernetesSecret } from './types';

/**
 * Utility functions for Kubernetes Secret operations
 */

// Constants for magic numbers
export const CONSTANTS = {
  MAX_SECRET_SIZE_BYTES: 1024 * 1024, // 1MB limit for secrets
  MAX_KEY_COUNT: 100, // Maximum number of keys
  PREVIEW_LENGTH: 15,
  PREVIEW_PREFIX_LENGTH: 3,
  MIN_TOKEN_LENGTH: 20,
  MIN_PASSWORD_LENGTH: 8,
  HIGH_ENTROPY_THRESHOLD: 0.6,
  MEDIUM_ENTROPY_THRESHOLD: 0.3,
} as const;

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
 * Sanitizes a value to prevent XSS attacks
 * Uses DOMPurify to strip out potentially malicious content
 */
export function sanitizeValue(value: string): string {
  // Configure DOMPurify to be strict
  const config = {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep the text content
  };

  return DOMPurify.sanitize(value, config);
}

/**
 * Safely decodes and sanitizes a base64 value
 */
export function safeDecodeAndSanitize(value: string): string {
  const decoded = safeBase64Decode(value);
  return sanitizeValue(decoded);
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

  // Token detection (comprehensive patterns) - check before binary
  const tokenPatterns = [
    // OpenAI
    { pattern: /^sk-[a-zA-Z0-9]{32,}$/, name: 'OpenAI API key' },
    { pattern: /^sk-proj-[a-zA-Z0-9]{32,}$/, name: 'OpenAI Project key' },
    // GitHub
    { pattern: /^ghp_[a-zA-Z0-9]{36}$/, name: 'GitHub Personal Access Token' },
    { pattern: /^gho_[a-zA-Z0-9]{36}$/, name: 'GitHub OAuth Token' },
    { pattern: /^ghs_[a-zA-Z0-9]{36}$/, name: 'GitHub Server Token' },
    { pattern: /^ghr_[a-zA-Z0-9]{36}$/, name: 'GitHub Refresh Token' },
    { pattern: /^github_pat_[a-zA-Z0-9_]{82}$/, name: 'GitHub Fine-Grained PAT' },
    // AWS
    { pattern: /^AKIA[0-9A-Z]{16}$/, name: 'AWS Access Key' },
    { pattern: /^ASIA[0-9A-Z]{16}$/, name: 'AWS Session Token' },
    // Google Cloud
    { pattern: /^AIza[0-9A-Za-z_-]{35}$/, name: 'Google API Key' },
    // Stripe
    { pattern: /^sk_live_[a-zA-Z0-9]{24,}$/, name: 'Stripe Live Secret Key' },
    { pattern: /^sk_test_[a-zA-Z0-9]{24,}$/, name: 'Stripe Test Secret Key' },
    { pattern: /^rk_live_[a-zA-Z0-9]{24,}$/, name: 'Stripe Live Restricted Key' },
    // Slack
    { pattern: /^xox[baprs]-[a-zA-Z0-9-]{10,}$/, name: 'Slack Token' },
    // Twilio
    { pattern: /^SK[a-z0-9]{32}$/, name: 'Twilio API Key' },
    // SendGrid
    { pattern: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/, name: 'SendGrid API Key' },
    // DigitalOcean
    { pattern: /^dop_v1_[a-f0-9]{64}$/, name: 'DigitalOcean Token' },
    // Heroku
    { pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/, name: 'Heroku API Key' },
    // NPM
    { pattern: /^npm_[a-zA-Z0-9]{36}$/, name: 'NPM Token' },
    // Mailgun
    { pattern: /^key-[a-zA-Z0-9]{32}$/, name: 'Mailgun API Key' },
    // Azure
    { pattern: /^[a-zA-Z0-9/+]{86}==$/, name: 'Azure Storage Key' },
    // JWT
    { pattern: /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, name: 'JWT Token' },
  ];

  for (const { pattern } of tokenPatterns) {
    if (pattern.test(value)) {
      return 'token';
    }
  }

  // Binary detection (non-printable characters)
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0E-\x1F\x7F-\xFF]/.test(value)) {
    return 'binary';
  }

  // General high-entropy string (longer tokens)
  if (value.length >= 30 && /^[a-zA-Z0-9_-]{30,}$/.test(value) && calculateEntropy(value) === 'high') {
    return 'token';
  }

  // Password detection (heuristic)
  if (value.length >= CONSTANTS.MIN_PASSWORD_LENGTH && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value)) {
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

  if (ratio >= CONSTANTS.HIGH_ENTROPY_THRESHOLD) return 'high';
  if (ratio >= CONSTANTS.MEDIUM_ENTROPY_THRESHOLD) return 'medium';
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
    // Enhanced token detection warnings
    const tokenWarnings = [
      { pattern: /^sk-[a-zA-Z0-9]{32,}$/, warning: 'Appears to be an OpenAI API key' },
      { pattern: /^sk-proj-[a-zA-Z0-9]{32,}$/, warning: 'Appears to be an OpenAI Project key' },
      { pattern: /^ghp_[a-zA-Z0-9]{36}$/, warning: 'Appears to be a GitHub Personal Access Token' },
      { pattern: /^gho_[a-zA-Z0-9]{36}$/, warning: 'Appears to be a GitHub OAuth Token' },
      { pattern: /^ghs_[a-zA-Z0-9]{36}$/, warning: 'Appears to be a GitHub Server Token' },
      { pattern: /^ghr_[a-zA-Z0-9]{36}$/, warning: 'Appears to be a GitHub Refresh Token' },
      { pattern: /^github_pat_[a-zA-Z0-9_]{82}$/, warning: 'Appears to be a GitHub Fine-Grained PAT' },
      { pattern: /^AKIA[0-9A-Z]{16}$/, warning: 'Appears to be an AWS Access Key' },
      { pattern: /^ASIA[0-9A-Z]{16}$/, warning: 'Appears to be an AWS Session Token' },
      { pattern: /^AIza[0-9A-Za-z_-]{35}$/, warning: 'Appears to be a Google API Key' },
      { pattern: /^sk_live_[a-zA-Z0-9]{24,}$/, warning: 'Appears to be a Stripe Live Secret Key - HIGHLY SENSITIVE' },
      { pattern: /^sk_test_[a-zA-Z0-9]{24,}$/, warning: 'Appears to be a Stripe Test Secret Key' },
      { pattern: /^xox[baprs]-[a-zA-Z0-9-]{10,}$/, warning: 'Appears to be a Slack Token' },
      { pattern: /^SK[a-z0-9]{32}$/, warning: 'Appears to be a Twilio API Key' },
      { pattern: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/, warning: 'Appears to be a SendGrid API Key' },
      { pattern: /^dop_v1_[a-f0-9]{64}$/, warning: 'Appears to be a DigitalOcean Token' },
      { pattern: /^npm_[a-zA-Z0-9]{36}$/, warning: 'Appears to be an NPM Token' },
      { pattern: /^key-[a-zA-Z0-9]{32}$/, warning: 'Appears to be a Mailgun API Key' },
      { pattern: /^eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/, warning: 'Appears to be a JWT Token' },
    ];

    for (const { pattern, warning } of tokenWarnings) {
      if (pattern.test(checkValue)) {
        warnings.push(warning);
        break;
      }
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
    // Check secret size
    const sizeInBytes = new Blob([yamlContent]).size;
    if (sizeInBytes > CONSTANTS.MAX_SECRET_SIZE_BYTES) {
      throw new Error(`Secret size (${Math.round(sizeInBytes / 1024)}KB) exceeds maximum allowed size (${Math.round(CONSTANTS.MAX_SECRET_SIZE_BYTES / 1024)}KB)`);
    }

    // Use js-yaml for proper YAML parsing
    const parsed = yaml.load(yamlContent) as KubernetesSecret;

    // Validate required fields
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML structure');
    }

    if (parsed.kind !== 'Secret') {
      throw new Error('YAML is not a Kubernetes Secret');
    }

    if (!parsed.metadata || !parsed.metadata.name) {
      throw new Error('Secret must have metadata.name');
    }

    const secretName = parsed.metadata.name;
    const secretNamespace = parsed.metadata.namespace || 'default';
    const secretType = parsed.type || 'Opaque';
    const dataSection = parsed.data || {};
    const stringDataSection = parsed.stringData || {};

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

    // Check for too many keys
    if (keys.length > CONSTANTS.MAX_KEY_COUNT) {
      securityWarnings.push(`Secret contains ${keys.length} keys, which exceeds recommended maximum of ${CONSTANTS.MAX_KEY_COUNT}`);
    }

    return {
      keys,
      metadata: {
        name: secretName,
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
    if (error instanceof yaml.YAMLException) {
      throw new Error(`YAML parsing error: ${error.message}`);
    }
    throw new Error(`Failed to parse Kubernetes Secret: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generates a preview of a secret value (truncated with asterisks)
 */
export function generateValuePreview(value: string, maxLength: number = CONSTANTS.PREVIEW_LENGTH): string {
  if (value === '') return '';

  const isBase64 = isValidBase64(value);
  const displayValue = isBase64 ? safeBase64Decode(value) : value;

  if (displayValue === '[Invalid Base64]') {
    const prefixLength = Math.min(CONSTANTS.PREVIEW_PREFIX_LENGTH, value.length);
    const asteriskCount = Math.max(0, Math.min(value.length - prefixLength, maxLength - prefixLength));
    return value.substring(0, prefixLength) + '*'.repeat(asteriskCount);
  }

  const prefixLength = Math.min(CONSTANTS.PREVIEW_PREFIX_LENGTH, displayValue.length);

  if (displayValue.length <= maxLength) {
    const asteriskCount = Math.max(0, displayValue.length - prefixLength);
    return displayValue.substring(0, prefixLength) + '*'.repeat(asteriskCount);
  }

  const asteriskCount = Math.max(0, maxLength - prefixLength);
  return displayValue.substring(0, prefixLength) + '*'.repeat(asteriskCount);
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

/**
 * Generates YAML from parsed secret data
 */
export function generateSecretYaml(parsedData: ParsedSecretData): string {
  const { metadata, keys } = parsedData;
  
  let yaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${metadata.name}`;
  
  if (metadata.namespace !== 'default') {
    yaml += `
  namespace: ${metadata.namespace}`;
  }
  
  yaml += `
type: ${metadata.type}`;

  // Separate data and stringData keys
  const dataKeys = keys.filter(k => k.encoding === 'base64');
  const stringDataKeys = keys.filter(k => k.encoding === 'string');

  if (dataKeys.length > 0) {
    yaml += '\ndata:';
    dataKeys.forEach(key => {
      yaml += `\n  ${key.key}: ${key.value}`;
    });
  }

  if (stringDataKeys.length > 0) {
    yaml += '\nstringData:';
    stringDataKeys.forEach(key => {
      // Properly quote string values that contain special characters
      const quotedValue = key.value.includes(':') || key.value.includes('"') || key.value.includes("'")
        ? `"${key.value.replace(/"/g, '\\"')}"` 
        : key.value;
      yaml += `\n  ${key.key}: ${quotedValue}`;
    });
  }

  return yaml;
}

/**
 * Updates a specific key in the parsed data
 */
export function updateSecretKey(
  parsedData: ParsedSecretData, 
  keyName: string, 
  newValue: string, 
  encoding: 'base64' | 'string' = 'base64'
): ParsedSecretData {
  const updatedKeys = parsedData.keys.map(key => {
    if (key.key === keyName) {
      const finalValue = encoding === 'base64' ? safeBase64Encode(newValue) : newValue;
      const analysis = analyzeSecretValue(keyName, finalValue);
      
      return {
        ...key,
        value: finalValue,
        encoding,
        type: analysis.detectedType
      };
    }
    return key;
  });

  // Recalculate analysis
  const allWarnings: string[] = [];
  const allSuggestions: string[] = [];
  
  updatedKeys.forEach(key => {
    const analysis = analyzeSecretValue(key.key, key.value);
    allWarnings.push(...analysis.warnings);
    allSuggestions.push(...analysis.suggestions);
  });

  return {
    ...parsedData,
    keys: updatedKeys,
    analysis: {
      totalKeys: updatedKeys.length,
      securityWarnings: [...new Set(allWarnings)],
      suggestions: [...new Set(allSuggestions)]
    }
  };
}

/**
 * Adds a new key to the parsed data
 */
export function addSecretKey(
  parsedData: ParsedSecretData,
  keyName: string,
  value: string,
  encoding: 'base64' | 'string' = 'base64'
): ParsedSecretData {
  const finalValue = encoding === 'base64' ? safeBase64Encode(value) : value;
  const analysis = analyzeSecretValue(keyName, finalValue);
  
  const newKey: SecretKeyValue = {
    key: keyName,
    value: finalValue,
    encoding,
    type: analysis.detectedType,
    include: true
  };

  const updatedKeys = [...parsedData.keys, newKey];
  
  // Recalculate analysis
  const allWarnings: string[] = [];
  const allSuggestions: string[] = [];
  
  updatedKeys.forEach(key => {
    const keyAnalysis = analyzeSecretValue(key.key, key.value);
    allWarnings.push(...keyAnalysis.warnings);
    allSuggestions.push(...keyAnalysis.suggestions);
  });

  return {
    ...parsedData,
    keys: updatedKeys,
    analysis: {
      totalKeys: updatedKeys.length,
      securityWarnings: [...new Set(allWarnings)],
      suggestions: [...new Set(allSuggestions)]
    }
  };
}

/**
 * Removes a key from the parsed data
 */
export function removeSecretKey(parsedData: ParsedSecretData, keyName: string): ParsedSecretData {
  const updatedKeys = parsedData.keys.filter(key => key.key !== keyName);
  
  // Recalculate analysis
  const allWarnings: string[] = [];
  const allSuggestions: string[] = [];
  
  updatedKeys.forEach(key => {
    const analysis = analyzeSecretValue(key.key, key.value);
    allWarnings.push(...analysis.warnings);
    allSuggestions.push(...analysis.suggestions);
  });

  return {
    ...parsedData,
    keys: updatedKeys,
    analysis: {
      totalKeys: updatedKeys.length,
      securityWarnings: [...new Set(allWarnings)],
      suggestions: [...new Set(allSuggestions)]
    }
  };
}