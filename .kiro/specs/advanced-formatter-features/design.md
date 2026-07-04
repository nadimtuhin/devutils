# Design Document

## Overview

This design document outlines the implementation of advanced formatter features for the DevUtils project. The new formatters will follow the established architectural patterns while introducing specialized functionality for XML, TOML, CSV, SVG, Environment files, Log files, GraphQL, and Dockerfile processing.

The design leverages the existing component structure, shared utilities, and UI patterns to maintain consistency with the current codebase while providing powerful new formatting capabilities.

## Architecture

### Component Structure

Following the existing pattern, each formatter will be implemented as a standalone React component in the `src/components/` directory:

- `XmlFormatter.tsx` - XML validation, formatting, and minification
- `TomlFormatter.tsx` - TOML validation, formatting, and JSON conversion
- `CsvAdvancedProcessor.tsx` - Advanced CSV processing with column operations
- `SvgOptimizer.tsx` - SVG formatting and optimization
- `EnvFileFormatter.tsx` - Environment file formatting and validation
- `LogFileProcessor.tsx` - Log file parsing and analysis
- `GraphqlFormatter.tsx` - GraphQL schema and query formatting
- `DockerfileFormatter.tsx` - Dockerfile formatting and optimization

### Shared Utilities

New utility modules will be created in `src/utils/` to handle format-specific processing:

- `xmlProcessor.ts` - XML parsing, validation, and formatting logic
- `tomlProcessor.ts` - TOML parsing and conversion utilities
- `csvProcessor.ts` - Advanced CSV parsing and transformation
- `svgProcessor.ts` - SVG optimization and cleaning
- `envProcessor.ts` - Environment file parsing and validation
- `logProcessor.ts` - Log parsing and analysis utilities
- `graphqlProcessor.ts` - GraphQL validation and formatting
- `dockerfileProcessor.ts` - Dockerfile parsing and optimization

### UI Component Patterns

All formatters will follow the established UI patterns:

1. **Dual-pane layout** with input and output sections
2. **Settings panel** for format-specific options
3. **Error handling** with clear error messages and line highlighting
4. **Copy/download functionality** using the existing TextAreaWithCopy pattern
5. **Line numbering** and syntax highlighting where applicable
6. **Responsive design** following TailwindCSS patterns

## Components and Interfaces

### Core Formatter Interface

```typescript
interface FormatterComponent {
  input: string;
  output: string;
  error: string | null;
  isProcessing: boolean;
  settings: FormatSettings;
  onInputChange: (value: string) => void;
  onSettingsChange: (settings: FormatSettings) => void;
  onFormat: () => void;
  onClear: () => void;
}
```

### Format-Specific Settings

Each formatter will have its own settings interface:

```typescript
interface XmlSettings {
  indentSize: number;
  preserveWhitespace: boolean;
  sortAttributes: boolean;
  minify: boolean;
  validateSchema: boolean;
}

interface TomlSettings {
  indentSize: number;
  sortKeys: boolean;
  convertToJson: boolean;
  preserveComments: boolean;
}

interface CsvSettings {
  delimiter: string;
  quoteChar: string;
  escapeChar: string;
  hasHeader: boolean;
  sortColumns: string[];
  filterColumns: string[];
}
```

### Processing Pipeline

Each formatter follows a consistent processing pipeline:

1. **Input Validation** - Check for empty input and basic format validation
2. **Parsing** - Parse the input using format-specific libraries
3. **Processing** - Apply formatting, optimization, or transformation
4. **Error Handling** - Capture and format errors with line numbers
5. **Output Generation** - Generate formatted output with proper structure

## Data Models

### Error Handling Model

```typescript
interface FormatError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: FormatError[];
  warnings: FormatError[];
}
```

### Processing Result Model

```typescript
interface ProcessingResult {
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
```

### File Analysis Model

```typescript
interface FileAnalysis {
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
```

## Error Handling

### Error Display Strategy

Following the existing pattern from JsonValidator and SqlFormatter:

1. **Inline Errors** - Display errors directly in the input area with line highlighting
2. **Error Panel** - Dedicated error panel showing detailed error information
3. **Toast Notifications** - Success/failure notifications for operations
4. **Validation Indicators** - Visual indicators for validation status

### Error Recovery

- **Partial Processing** - Continue processing valid portions when possible
- **Suggestion Engine** - Provide suggestions for common formatting issues
- **Auto-correction** - Offer automatic fixes for simple syntax errors

## Testing Strategy

### Unit Testing

Each utility module will have comprehensive unit tests:

- **Parser Tests** - Test parsing of valid and invalid inputs
- **Formatter Tests** - Test formatting output consistency
- **Error Handling Tests** - Test error detection and reporting
- **Settings Tests** - Test various configuration options

### Integration Testing

Component-level tests using React Testing Library:

- **User Interaction Tests** - Test input, formatting, and settings changes
- **Error State Tests** - Test error display and recovery
- **Copy/Download Tests** - Test utility functions
- **Accessibility Tests** - Test keyboard navigation and screen reader support

### Performance Testing

- **Large File Handling** - Test with large input files
- **Memory Usage** - Monitor memory consumption during processing
- **Processing Speed** - Benchmark formatting operations
- **Browser Compatibility** - Test across different browsers

### Test Data

Create comprehensive test datasets:

- **Valid Samples** - Well-formed examples for each format
- **Invalid Samples** - Common error cases and edge cases
- **Large Samples** - Performance testing with large files
- **Edge Cases** - Boundary conditions and unusual formatting

## Implementation Phases

### Phase 1: Core Infrastructure
- Set up utility modules and shared interfaces
- Implement error handling and validation framework
- Create base formatter component template

### Phase 2: Basic Formatters
- Implement XML, TOML, and Environment file formatters
- Add basic validation and formatting capabilities
- Integrate with existing UI patterns

### Phase 3: Advanced Features
- Implement CSV processor with column operations
- Add SVG optimizer with size reduction metrics
- Create log file processor with filtering capabilities

### Phase 4: Specialized Tools
- Implement GraphQL formatter with schema validation
- Add Dockerfile formatter with optimization suggestions
- Enhance all formatters with advanced settings

### Phase 5: Polish and Optimization
- Performance optimization for large files
- Enhanced error messages and suggestions
- Accessibility improvements and keyboard shortcuts

## Dependencies

### New Dependencies

- `fast-xml-parser` - XML parsing and validation
- `@iarna/toml` - TOML parsing and formatting
- `papaparse` - Advanced CSV parsing
- `svgo` - SVG optimization
- `graphql` - GraphQL parsing and validation
- `dockerfile-ast` - Dockerfile parsing

### Existing Dependencies

Leverage existing dependencies where possible:
- React and TypeScript for component structure
- TailwindCSS for styling consistency
- Lucide React for icons
- Existing utility patterns for common functionality