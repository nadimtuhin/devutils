// Kubernetes Secret and ConfigMap Types
export interface KubernetesSecret {
  apiVersion: 'v1';
  kind: 'Secret';
  metadata: {
    name: string;
    namespace?: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
  };
  type?: 'Opaque' | 'kubernetes.io/dockerconfigjson' | 'kubernetes.io/tls' | string;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
}

export interface SecretKeyValue {
  key: string;
  value: string;
  encoding: 'base64' | 'string';
  type: SecretValueType;
  include: boolean;
}

export type SecretValueType = 
  | 'url'
  | 'token'
  | 'certificate'
  | 'json'
  | 'yaml'
  | 'xml'
  | 'binary'
  | 'text'
  | 'email'
  | 'password'
  | 'unknown';

export interface SecretAnalysis {
  isValidBase64: boolean;
  detectedType: SecretValueType;
  hasCredentials: boolean;
  entropy: 'low' | 'medium' | 'high';
  warnings: string[];
  suggestions: string[];
}

export interface ParsedSecretData {
  keys: SecretKeyValue[];
  metadata: {
    name: string;
    namespace: string;
    type: string;
  };
  analysis: {
    totalKeys: number;
    securityWarnings: string[];
    suggestions: string[];
  };
}