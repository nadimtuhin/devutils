import {
  isValidBase64,
  safeBase64Decode,
  safeBase64Encode,
  detectSecretValueType,
  calculateEntropy,
  analyzeSecretValue,
  parseKubernetesSecret,
  generateValuePreview,
  validateSecretYaml
} from './SecretUtils';

describe('SecretUtils', () => {
  describe('isValidBase64', () => {
    it('should return true for valid base64 strings', () => {
      expect(isValidBase64('SGVsbG8gV29ybGQ=')).toBe(true);
      expect(isValidBase64('dGVzdA==')).toBe(true);
      expect(isValidBase64('YWJjZA==')).toBe(true);
    });

    it('should return false for invalid base64 strings', () => {
      expect(isValidBase64('not-base64')).toBe(false);
      expect(isValidBase64('invalid!')).toBe(false);
      expect(isValidBase64('')).toBe(false);
    });
  });

  describe('safeBase64Decode', () => {
    it('should decode valid base64 strings', () => {
      expect(safeBase64Decode('SGVsbG8gV29ybGQ=')).toBe('Hello World');
      expect(safeBase64Decode('dGVzdA==')).toBe('test');
    });

    it('should return error message for invalid base64', () => {
      expect(safeBase64Decode('invalid!')).toBe('[Invalid Base64]');
    });
  });

  describe('safeBase64Encode', () => {
    it('should encode strings to base64', () => {
      expect(safeBase64Encode('Hello World')).toBe('SGVsbG8gV29ybGQ=');
      expect(safeBase64Encode('test')).toBe('dGVzdA==');
    });

    it('should handle empty strings', () => {
      expect(safeBase64Encode('')).toBe('');
    });
  });

  describe('detectSecretValueType', () => {
    it('should detect URLs', () => {
      expect(detectSecretValueType('https://example.com')).toBe('url');
      expect(detectSecretValueType('postgres://user:pass@localhost:5432/db')).toBe('url');
      expect(detectSecretValueType('redis://localhost:6379')).toBe('url');
    });

    it('should detect emails', () => {
      expect(detectSecretValueType('user@example.com')).toBe('email');
      expect(detectSecretValueType('test.email+tag@domain.co.uk')).toBe('email');
    });

    it('should detect certificates', () => {
      expect(detectSecretValueType('-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----')).toBe('certificate');
      expect(detectSecretValueType('-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----')).toBe('certificate');
    });

    it('should detect JSON', () => {
      expect(detectSecretValueType('{"key": "value"}')).toBe('json');
      expect(detectSecretValueType('{"port": 3000, "debug": true}')).toBe('json');
    });

    it('should detect tokens', () => {
      expect(detectSecretValueType('sk-abcdefghijklmnopqrstuvwxyz123456')).toBe('token');
      expect(detectSecretValueType('ghp_abcdefghijklmnopqrstuvwxyz123456')).toBe('token');
      expect(detectSecretValueType('AKIAIOSFODNN7EXAMPLE')).toBe('token');
    });

    it('should detect YAML', () => {
      expect(detectSecretValueType('key: value\nother: data')).toBe('yaml');
      expect(detectSecretValueType('- item1\n- item2')).toBe('yaml');
    });

    it('should detect XML', () => {
      expect(detectSecretValueType('<root><child>value</child></root>')).toBe('xml');
    });

    it('should default to text for simple strings', () => {
      expect(detectSecretValueType('simple text')).toBe('text');
      expect(detectSecretValueType('123')).toBe('text');
    });
  });

  describe('calculateEntropy', () => {
    it('should calculate low entropy', () => {
      expect(calculateEntropy('aaaaaaaa')).toBe('low');
      expect(calculateEntropy('1111111111')).toBe('low');
    });

    it('should calculate medium entropy', () => {
      expect(calculateEntropy('abcabcabc')).toBe('medium');
      expect(calculateEntropy('abcabc')).toBe('medium');
    });

    it('should calculate high entropy', () => {
      expect(calculateEntropy('abcdefghijk')).toBe('high');
      expect(calculateEntropy('A1b2C3d4E5f6')).toBe('high');
    });
  });

  describe('analyzeSecretValue', () => {
    it('should detect URL with credentials', () => {
      const analysis = analyzeSecretValue('db_url', 'postgres://user:pass@localhost:5432/db');
      expect(analysis.detectedType).toBe('url');
      expect(analysis.hasCredentials).toBe(true);
      expect(analysis.warnings).toContain('URL contains embedded credentials');
    });

    it('should detect OpenAI API key', () => {
      const analysis = analyzeSecretValue('api_key', 'sk-abcdefghijklmnopqrstuvwxyz123456');
      expect(analysis.detectedType).toBe('token');
      expect(analysis.warnings).toContain('Appears to be an OpenAI API key');
    });

    it('should detect GitHub token', () => {
      const analysis = analyzeSecretValue('github_token', 'ghp_abcdefghijklmnopqrstuvwxyz123456');
      expect(analysis.detectedType).toBe('token');
      expect(analysis.warnings).toContain('Appears to be a GitHub personal access token');
    });

    it('should detect AWS access key', () => {
      const analysis = analyzeSecretValue('aws_key', 'AKIAIOSFODNN7EXAMPLE');
      expect(analysis.detectedType).toBe('token');
      expect(analysis.warnings).toContain('Appears to be an AWS access key');
    });

    it('should warn about plaintext passwords', () => {
      const analysis = analyzeSecretValue('password', 'mypassword123');
      expect(analysis.warnings).toContain('Password stored in plaintext - should be base64 encoded');
    });
  });

  describe('parseKubernetesSecret', () => {
    const validSecretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: my-secret
  namespace: default
type: Opaque
data:
  username: dXNlcm5hbWU=
  password: cGFzc3dvcmQ=
stringData:
  config: '{"debug": true}'`;

    it('should parse valid Kubernetes Secret YAML', () => {
      const result = parseKubernetesSecret(validSecretYaml);
      
      expect(result.metadata.name).toBe('my-secret');
      expect(result.metadata.namespace).toBe('default');
      expect(result.metadata.type).toBe('Opaque');
      expect(result.keys).toHaveLength(3);
      
      const usernameKey = result.keys.find(k => k.key === 'username');
      expect(usernameKey?.encoding).toBe('base64');
      expect(usernameKey?.value).toBe('dXNlcm5hbWU=');
      
      const configKey = result.keys.find(k => k.key === 'config');
      expect(configKey?.encoding).toBe('string');
      expect(configKey?.type).toBe('text'); // Single quoted JSON is detected as text
    });

    it('should handle missing optional fields with defaults', () => {
      const minimalYaml = `apiVersion: v1
kind: Secret
metadata:
  name: minimal-secret
data:
  key: dmFsdWU=`;
      
      const result = parseKubernetesSecret(minimalYaml);
      expect(result.metadata.namespace).toBe('default');
      expect(result.metadata.type).toBe('Opaque');
    });

    it('should handle invalid YAML gracefully', () => {
      const result = parseKubernetesSecret('invalid yaml content');
      expect(result.keys).toHaveLength(0);
      expect(result.metadata.name).toBe('unnamed-secret');
    });
  });

  describe('generateValuePreview', () => {
    it('should generate preview for short values', () => {
      expect(generateValuePreview('simple')).toBe('sim***');
      expect(generateValuePreview('hello!')).toBe('hel***');
    });

    it('should generate preview for long values', () => {
      expect(generateValuePreview('verylongpassword123456')).toBe('ver************');
    });

    it('should handle base64 encoded values', () => {
      const base64Value = 'SGVsbG8gV29ybGQ='; // "Hello World"
      expect(generateValuePreview(base64Value)).toBe('Hel********');
    });

    it('should handle empty values', () => {
      expect(generateValuePreview('')).toBe('');
    });
  });

  describe('validateSecretYaml', () => {
    it('should validate correct Secret YAML', () => {
      const validYaml = `apiVersion: v1
kind: Secret
metadata:
  name: test-secret
data:
  key: dmFsdWU=`;
      
      const result = validateSecretYaml(validYaml);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing apiVersion', () => {
      const invalidYaml = `kind: Secret
metadata:
  name: test-secret
data:
  key: dmFsdWU=`;
      
      const result = validateSecretYaml(invalidYaml);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required apiVersion: v1');
    });

    it('should detect missing kind', () => {
      const invalidYaml = `apiVersion: v1
metadata:
  name: test-secret
data:
  key: dmFsdWU=`;
      
      const result = validateSecretYaml(invalidYaml);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required kind: Secret');
    });

    it('should detect missing metadata name', () => {
      const invalidYaml = `apiVersion: v1
kind: Secret
metadata:
  namespace: default
data:
  key: dmFsdWU=`;
      
      const result = validateSecretYaml(invalidYaml);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing required metadata.name field');
    });

    it('should detect missing data sections', () => {
      const invalidYaml = `apiVersion: v1
kind: Secret
metadata:
  name: test-secret
type: Opaque`;
      
      const result = validateSecretYaml(invalidYaml);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Secret must have either data or stringData section');
    });

    it('should accept stringData instead of data', () => {
      const validYaml = `apiVersion: v1
kind: Secret
metadata:
  name: test-secret
stringData:
  key: value`;
      
      const result = validateSecretYaml(validYaml);
      expect(result.isValid).toBe(true);
    });
  });
});