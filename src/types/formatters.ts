// Base formatter interfaces and types

export interface FormatError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormatError[];
  warnings: FormatError[];
}

export interface ProcessingResult {
  success: boolean;
  output: string;
  errors: FormatError[];
  metadata?: {
    originalSize: number;
    processedSize: number;
    compressionRatio?: number;
    processingTime: number;
  };
}

export interface FileAnalysis {
  format: string;
  version?: string;
  encoding: string;
  lineCount: number;
  characterCount: number;
  structure?: {
    depth: number;
    elements: number;
    attributes?: number;
  };
}

// Base formatter settings interface
export interface BaseFormatSettings {
  indentSize: number;
  preserveComments: boolean;
}

// Format-specific settings interfaces
export interface XmlSettings extends BaseFormatSettings {
  preserveWhitespace: boolean;
  sortAttributes: boolean;
  minify: boolean;
  validateSchema: boolean;
}

export interface TomlSettings extends BaseFormatSettings {
  sortKeys: boolean;
  convertToJson: boolean;
}

export interface CsvSettings {
  delimiter: string;
  quoteChar: string;
  escapeChar: string;
  hasHeader: boolean;
  sortColumns: string[];
  filterColumns: string[];
}

export interface SvgSettings extends BaseFormatSettings {
  optimize: boolean;
  precision: number;
  removeComments: boolean;
  removeMetadata: boolean;
  removeUnusedNS: boolean;
}

export interface EnvSettings {
  sortKeys: boolean;
  groupByPrefix: boolean;
  preserveComments: boolean;
  showDuplicates: boolean;
}

export interface LogSettings {
  format: 'auto' | 'apache' | 'nginx' | 'json' | 'custom';
  filterLevel: 'all' | 'error' | 'warn' | 'info' | 'debug';
  showTimestamps: boolean;
  parseStackTraces: boolean;
}

export interface GraphqlSettings extends BaseFormatSettings {
  sortDefinitions: boolean;
  validateSchema: boolean;
  showDocumentation: boolean;
}

export interface DockerfileSettings extends BaseFormatSettings {
  showOptimizations: boolean;
  checkSecurity: boolean;
  formatMultiLine: boolean;
}

// Core formatter component interface
export interface FormatterComponent {
  input: string;
  output: string;
  error: string | null;
  isProcessing: boolean;
  settings: BaseFormatSettings;
  onInputChange: (value: string) => void;
  onSettingsChange: (settings: BaseFormatSettings) => void;
  onFormat: () => void;
  onClear: () => void;
}

// Processor function type
export type ProcessorFunction<T extends BaseFormatSettings> = (
  input: string,
  settings: T
) => Promise<ProcessingResult>;