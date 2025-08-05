import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, Copy, AlertTriangle, CheckCircle, Info, RotateCcw } from 'lucide-react';
import TextAreaWithCopy from '../TextAreaWithCopy';
import {
  parseKubernetesSecret,
  validateSecretYaml,
  generateValuePreview,
  safeBase64Decode,
  analyzeSecretValue
} from './shared/SecretUtils';
import { ParsedSecretData, SecretKeyValue } from './shared/types';

interface RevealedValues {
  [key: string]: boolean;
}

export default function Base64SecretDecoder() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedSecretData | null>(null);
  const [error, setError] = useState<string>('');
  const [revealedValues, setRevealedValues] = useState<RevealedValues>({});
  const [selectedKey, setSelectedKey] = useState<string>('');

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError('');
    setParsedData(null);
    setRevealedValues({});
    setSelectedKey('');

    if (!value.trim()) return;

    try {
      // Validate YAML structure first
      const validation = validateSecretYaml(value);
      if (!validation.isValid) {
        setError(`Invalid Kubernetes Secret: ${validation.errors.join(', ')}`);
        return;
      }

      // Parse the secret
      const parsed = parseKubernetesSecret(value);
      setParsedData(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse secret');
    }
  }, []);

  const toggleReveal = useCallback((key: string) => {
    setRevealedValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  const handleReset = useCallback(() => {
    setInput('');
    setParsedData(null);
    setError('');
    setRevealedValues({});
    setSelectedKey('');
  }, []);

  const getSelectedKeyDetails = useCallback(() => {
    if (!selectedKey || !parsedData) return null;
    
    const keyData = parsedData.keys.find(k => k.key === selectedKey);
    if (!keyData) return null;

    const analysis = analyzeSecretValue(keyData.key, keyData.value);
    const decodedValue = keyData.encoding === 'base64' ? safeBase64Decode(keyData.value) : keyData.value;

    return {
      keyData,
      analysis,
      decodedValue
    };
  }, [selectedKey, parsedData]);

  const selectedDetails = getSelectedKeyDetails();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Base64 Secret Decoder & Validator
        </h1>
        <p className="text-gray-600">
          Parse Kubernetes Secret YAML, decode base64 values, and analyze for security issues.
          All processing happens locally in your browser.
        </p>
      </div>

      {/* Input Method Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Input Method</h2>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input type="radio" name="inputMethod" className="mr-2" defaultChecked />
            <span className="text-sm">Paste Secret YAML</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="inputMethod" className="mr-2" disabled />
            <span className="text-sm text-gray-400">Paste Raw Base64</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="inputMethod" className="mr-2" disabled />
            <span className="text-sm text-gray-400">Upload Secret File</span>
          </label>
        </div>
      </div>

      {/* Secret Input */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Secret Input</h2>
        </div>
        <div className="p-4">
          <TextAreaWithCopy
            value={input}
            onChange={handleInputChange}
            placeholder={`apiVersion: v1
kind: Secret
metadata:
  name: my-secret
data:
  DATABASE_URL: cG9zdGdyZXM6Ly91c2VyOnB3ZEBsb2NhbGhvc3Q6NTQzMi9kYg==
  API_KEY: c2stYWJjZGVmZ2hpams=
  config.json: eyJwb3J0IjozMDAwLCJkZWJ1ZyI6dHJ1ZX0=`}
            rows={12}
            showCopy={false}
          />
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} className="text-red-600" />
            <span className="text-red-800 font-medium">Error</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {/* Parsed Results */}
      {parsedData && (
        <>
          {/* Decoded Values Table */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Decoded Values</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Key</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Preview</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {parsedData.keys.map((keyData: SecretKeyValue) => {
                    const analysis = analyzeSecretValue(keyData.key, keyData.value);
                    const preview = generateValuePreview(keyData.value);
                    const hasWarnings = analysis.warnings.length > 0;
                    
                    return (
                      <tr 
                        key={keyData.key}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedKey === keyData.key ? 'bg-blue-50' : ''}`}
                        onClick={() => setSelectedKey(keyData.key)}
                      >
                        <td className="px-4 py-3 font-mono text-sm">{keyData.key}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">
                              {analysis.detectedType === 'url' && '🔗'}
                              {analysis.detectedType === 'token' && '🔑'}
                              {analysis.detectedType === 'certificate' && '📄'}
                              {analysis.detectedType === 'json' && '📋'}
                              {analysis.detectedType === 'email' && '📧'}
                              {analysis.detectedType === 'password' && '🔐'}
                              {analysis.detectedType === 'binary' && '🔢'}
                              {analysis.detectedType === 'text' && '📝'}
                              {' ' + analysis.detectedType}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-gray-600">
                          {preview}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReveal(keyData.key);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Toggle visibility"
                            >
                              {revealedValues[keyData.key] ? (
                                <EyeOff size={16} />
                              ) : (
                                <Eye size={16} />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const value = keyData.encoding === 'base64' 
                                  ? safeBase64Decode(keyData.value) 
                                  : keyData.value;
                                copyToClipboard(value);
                              }}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Copy decoded value"
                            >
                              <Copy size={16} />
                            </button>
                            {hasWarnings && (
                              <AlertTriangle size={16} className="text-amber-500" title="Security warnings" />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Analysis */}
          {parsedData.analysis.securityWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle size={20} className="text-amber-600" />
                <span className="text-amber-800 font-medium">Security Analysis</span>
              </div>
              <div className="space-y-2">
                {parsedData.analysis.securityWarnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-amber-600">⚠️</span>
                    <span className="text-amber-800 text-sm">{warning}</span>
                  </div>
                ))}
              </div>
              {parsedData.analysis.suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-amber-800 font-medium mb-2">Suggestions:</h4>
                  <div className="space-y-1">
                    {parsedData.analysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-amber-600">💡</span>
                        <span className="text-amber-700 text-sm">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Selected Value Details */}
          {selectedDetails && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Value Details: {selectedKey}
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Raw Base64 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Raw Base64</h3>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                    {selectedDetails.keyData.value}
                  </div>
                </div>

                {/* Decoded Value */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Decoded Value</h3>
                  {revealedValues[selectedKey] ? (
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all">
                      {selectedDetails.decodedValue}
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <button
                        onClick={() => toggleReveal(selectedKey)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                        <span>Click to reveal sensitive content</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Analysis Details */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm text-gray-700">
                        Valid base64 encoding: {selectedDetails.analysis.isValidBase64 ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Info size={16} className="text-blue-600" />
                      <span className="text-sm text-gray-700">
                        Detected type: {selectedDetails.analysis.detectedType}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Info size={16} className="text-blue-600" />
                      <span className="text-sm text-gray-700">
                        Entropy level: {selectedDetails.analysis.entropy}
                      </span>
                    </div>
                    {selectedDetails.analysis.hasCredentials && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        <span className="text-sm text-amber-700">Contains embedded credentials</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secret Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info size={20} className="text-blue-600" />
              <span className="text-blue-800 font-medium">Secret Summary</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Name:</span>
                <span className="ml-2 text-blue-800">{parsedData.metadata.name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Namespace:</span>
                <span className="ml-2 text-blue-800">{parsedData.metadata.namespace}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Type:</span>
                <span className="ml-2 text-blue-800">{parsedData.metadata.type}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Total Keys:</span>
                <span className="ml-2 text-blue-800">{parsedData.analysis.totalKeys}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Security Issues:</span>
                <span className="ml-2 text-blue-800">{parsedData.analysis.securityWarnings.length}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Privacy Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle size={20} className="text-green-600" />
          <span className="text-green-800 font-medium">Privacy First</span>
        </div>
        <p className="text-green-700 text-sm mt-2">
          All secret decoding and analysis happens locally in your browser. 
          No data is transmitted to external servers or logged anywhere.
        </p>
      </div>
    </div>
  );
}