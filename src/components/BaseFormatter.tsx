import React, { useState, useCallback } from 'react';
import { Copy, Download, Settings, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { BaseFormatSettings, FormatError, ProcessingResult } from '../types/formatters';
import { formatErrorMessage, groupErrorsBySeverity } from '../utils/errorHandling';
import { TextAreaWithCopy } from './TextAreaWithCopy';

interface BaseFormatterProps<T extends BaseFormatSettings> {
  title: string;
  description: string;
  placeholder: string;
  settings: T;
  onSettingsChange: (settings: T) => void;
  onProcess: (input: string, settings: T) => Promise<ProcessingResult>;
  renderSettings?: (settings: T, onChange: (settings: T) => void) => React.ReactNode;
  children?: React.ReactNode;
}

export function BaseFormatter<T extends BaseFormatSettings>({
  title,
  description,
  placeholder,
  settings,
  onSettingsChange,
  onProcess,
  renderSettings,
  children,
}: BaseFormatterProps<T>) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState<FormatError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [processingMetadata, setProcessingMetadata] = useState<ProcessingResult['metadata']>();

  const handleProcess = useCallback(async () => {
    if (!input.trim()) {
      setOutput('');
      setErrors([]);
      setProcessingMetadata(undefined);
      return;
    }

    setIsProcessing(true);
    try {
      const result = await onProcess(input, settings);
      setOutput(result.output);
      setErrors(result.errors);
      setProcessingMetadata(result.metadata);
    } catch (error) {
      setOutput('');
      setErrors([{
        message: error instanceof Error ? error.message : 'Processing failed',
        severity: 'error' as const,
      }]);
      setProcessingMetadata(undefined);
    } finally {
      setIsProcessing(false);
    }
  }, [input, settings, onProcess]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setErrors([]);
    setProcessingMetadata(undefined);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output]);

  const groupedErrors = groupErrorsBySeverity(errors);
  const hasErrors = errors.length > 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Settings Panel */}
      {renderSettings && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Settings size={16} />
            <span>Settings</span>
          </button>
          
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              {renderSettings(settings, onSettingsChange)}
            </div>
          )}
        </div>
      )}

      {/* Processing Metadata */}
      {processingMetadata && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-4 text-sm text-blue-800">
            <span>Original: {processingMetadata.originalSize} bytes</span>
            <span>Processed: {processingMetadata.processedSize} bytes</span>
            {processingMetadata.compressionRatio !== undefined && (
              <span>
                {processingMetadata.compressionRatio > 0 ? 'Reduced' : 'Increased'} by{' '}
                {Math.abs(processingMetadata.compressionRatio * 100).toFixed(1)}%
              </span>
            )}
            <span>Time: {processingMetadata.processingTime}ms</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {hasErrors && (
        <div className="mb-6 space-y-2">
          {groupedErrors.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-800 text-sm">{formatErrorMessage(error)}</span>
            </div>
          ))}
          
          {groupedErrors.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-800 text-sm">{formatErrorMessage(warning)}</span>
            </div>
          ))}
          
          {groupedErrors.info.map((info, index) => (
            <div key={`info-${index}`} className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-blue-800 text-sm">{formatErrorMessage(info)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Input</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Format'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Output</h2>
            <div className="flex space-x-2">
              {output && (
                <>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Download as file"
                  >
                    <Download size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <TextAreaWithCopy
            value={output}
            placeholder="Formatted output will appear here..."
            readOnly
            className="h-96"
          />
        </div>
      </div>

      {/* Success Indicator */}
      {output && !hasErrors && (
        <div className="mt-4 flex items-center space-x-2 text-green-600">
          <CheckCircle size={16} />
          <span className="text-sm">Successfully processed</span>
        </div>
      )}

      {/* Additional Content */}
      {children}
    </div>
  );
}