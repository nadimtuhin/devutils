import React, { useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Copy, AlertTriangle, CheckCircle, Info, RotateCcw, Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import { TextAreaWithCopy } from '../TextAreaWithCopy';
import {
  parseKubernetesSecret,
  validateSecretYaml,
  generateValuePreview,
  safeBase64Decode,
  analyzeSecretValue,
  generateSecretYaml,
  updateSecretKey,
  addSecretKey,
  removeSecretKey,
  sanitizeValue,
  safeDecodeAndSanitize
} from './shared/SecretUtils';
import { ParsedSecretData, SecretKeyValue } from './shared/types';
import { ErrorBoundary } from './shared/ErrorBoundary';

interface RevealedValues {
  [key: string]: boolean;
}

interface EditingKey {
  key: string;
  originalValue: string;
  newValue: string;
  encoding: 'base64' | 'string';
}

function Base64SecretDecoderComponent() {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState<ParsedSecretData | null>(null);
  const [error, setError] = useState<string>('');
  const [revealedValues, setRevealedValues] = useState<RevealedValues>({});
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<EditingKey | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyEncoding, setNewKeyEncoding] = useState<'base64' | 'string'>('base64');

  // Auto-generate YAML when data changes
  const generatedYaml = useMemo(() => {
    if (!parsedData) return '';
    return generateSecretYaml(parsedData);
  }, [parsedData]);

  // Memoize analysis for all keys to prevent recalculation on every render
  const keyAnalysisMap = useMemo(() => {
    if (!parsedData) return new Map();
    const map = new Map();
    parsedData.keys.forEach(keyData => {
      map.set(keyData.key, analyzeSecretValue(keyData.key, keyData.value));
    });
    return map;
  }, [parsedData]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    setError('');
    setParsedData(null);
    setRevealedValues({});
    setSelectedKey('');
    setSidebarOpen(false);

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
    setSidebarOpen(false);
    setEditingKey(null);
    setAddingNew(false);
  }, []);

  const selectKey = useCallback((key: string) => {
    setSelectedKey(key);
    setSidebarOpen(true);
    setEditingKey(null);
    setAddingNew(false);
  }, []);

  const startEditing = useCallback((key: string) => {
    if (!parsedData) return;

    const keyData = parsedData.keys.find(k => k.key === key);
    if (!keyData) return;

    const currentValue = keyData.encoding === 'base64'
      ? safeDecodeAndSanitize(keyData.value)
      : sanitizeValue(keyData.value);

    setEditingKey({
      key,
      originalValue: currentValue,
      newValue: currentValue,
      encoding: keyData.encoding
    });
    setSelectedKey(key);
    setSidebarOpen(true);
  }, [parsedData]);

  const saveEdit = useCallback(() => {
    if (!editingKey || !parsedData) return;

    const updatedData = updateSecretKey(
      parsedData,
      editingKey.key,
      editingKey.newValue,
      editingKey.encoding
    );
    
    setParsedData(updatedData);
    setEditingKey(null);
    
    // Update the input with the new YAML
    const newYaml = generateSecretYaml(updatedData);
    setInput(newYaml);
  }, [editingKey, parsedData]);

  const cancelEdit = useCallback(() => {
    setEditingKey(null);
  }, []);

  const deleteKey = useCallback((key: string) => {
    if (!parsedData) return;
    
    const updatedData = removeSecretKey(parsedData, key);
    setParsedData(updatedData);
    
    if (selectedKey === key) {
      setSelectedKey('');
      setSidebarOpen(false);
    }
    
    // Update the input with the new YAML
    const newYaml = generateSecretYaml(updatedData);
    setInput(newYaml);
  }, [parsedData, selectedKey]);

  const startAddingNew = useCallback(() => {
    setAddingNew(true);
    setNewKeyName('');
    setNewKeyValue('');
    setNewKeyEncoding('base64');
    setSelectedKey('');
    setSidebarOpen(true);
  }, []);

  const saveNewKey = useCallback(() => {
    if (!parsedData || !newKeyName.trim()) return;

    const updatedData = addSecretKey(
      parsedData,
      newKeyName,
      newKeyValue,
      newKeyEncoding
    );
    
    setParsedData(updatedData);
    setAddingNew(false);
    setNewKeyName('');
    setNewKeyValue('');
    
    // Update the input with the new YAML
    const newYaml = generateSecretYaml(updatedData);
    setInput(newYaml);
    
    // Select the new key
    setSelectedKey(newKeyName);
  }, [parsedData, newKeyName, newKeyValue, newKeyEncoding]);

  const cancelAddNew = useCallback(() => {
    setAddingNew(false);
    setNewKeyName('');
    setNewKeyValue('');
    setSidebarOpen(false);
  }, []);

  const getSelectedKeyDetails = useCallback(() => {
    if (!selectedKey || !parsedData) return null;

    const keyData = parsedData.keys.find(k => k.key === selectedKey);
    if (!keyData) return null;

    const analysis = keyAnalysisMap.get(keyData.key) || analyzeSecretValue(keyData.key, keyData.value);
    const decodedValue = keyData.encoding === 'base64'
      ? safeDecodeAndSanitize(keyData.value)
      : sanitizeValue(keyData.value);

    return {
      keyData,
      analysis,
      decodedValue
    };
  }, [selectedKey, parsedData, keyAnalysisMap]);

  const selectedDetails = getSelectedKeyDetails();

  return (
    <div className="flex h-screen bg-gray-100 -m-8">
      {/* Main Content */}
      <div className={`flex-1 overflow-auto transition-all duration-300 ${sidebarOpen ? 'mr-96' : ''}`}>
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Base64 Secret Decoder & Editor
              </h1>
              <p className="text-gray-600">
                Parse, decode, and edit Kubernetes Secrets with real-time YAML generation.
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

            {/* Split View: Input and Generated YAML */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Secret Input */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Input YAML</h2>
                </div>
                <div className="p-4">
                  <TextAreaWithCopy
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={`apiVersion: v1
kind: Secret
metadata:
  name: my-secret
data:
  DATABASE_URL: cG9zdGdyZXM6Ly91c2VyOnB3ZEBsb2NhbGhvc3Q6NTQzMi9kYg==
  API_KEY: c2stYWJjZGVmZ2hpams=`}
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

              {/* Generated YAML */}
              {parsedData && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Generated YAML</h2>
                    <p className="text-sm text-gray-600">Updates automatically as you edit</p>
                  </div>
                  <div className="p-4">
                    <TextAreaWithCopy
                      value={generatedYaml}
                      readOnly
                    />
                  </div>
                </div>
              )}
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

            {/* Parsed Results - Keys Table */}
            {parsedData && (
              <>
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Secret Keys</h2>
                    <button
                      onClick={startAddingNew}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                    >
                      <Plus size={16} />
                      <span>Add Key</span>
                    </button>
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
                          const analysis = keyAnalysisMap.get(keyData.key) || analyzeSecretValue(keyData.key, keyData.value);
                          const isRevealed = revealedValues[keyData.key];
                          const fullValue = keyData.encoding === 'base64'
                            ? safeDecodeAndSanitize(keyData.value)
                            : sanitizeValue(keyData.value);
                          const preview = isRevealed ? fullValue : generateValuePreview(keyData.value);
                          const hasWarnings = analysis.warnings.length > 0;

                          return (
                            <tr
                              key={keyData.key}
                              className={`cursor-pointer hover:bg-gray-50 ${selectedKey === keyData.key ? 'bg-blue-50' : ''}`}
                              onClick={() => selectKey(keyData.key)}
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
                              <td className="px-4 py-3 font-mono text-sm text-gray-600 break-all">
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
                                        ? safeDecodeAndSanitize(keyData.value)
                                        : sanitizeValue(keyData.value);
                                      copyToClipboard(value);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    title="Copy decoded value"
                                  >
                                    <Copy size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startEditing(keyData.key);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded text-blue-600"
                                    title="Edit value"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteKey(keyData.key);
                                    }}
                                    className="p-1 hover:bg-gray-200 rounded text-red-600"
                                    title="Delete key"
                                  >
                                    <Trash2 size={16} />
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
        </div>
      </div>

      {/* Right Sidebar */}
      {sidebarOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {addingNew ? 'Add New Key' : editingKey ? `Edit: ${editingKey.key}` : 'Key Details'}
              </h3>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setEditingKey(null);
                  setAddingNew(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Add New Key Form */}
            {addingNew && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., API_KEY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <textarea
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter the secret value..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encoding</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="newKeyEncoding"
                        value="base64"
                        checked={newKeyEncoding === 'base64'}
                        onChange={(e) => setNewKeyEncoding(e.target.value as 'base64' | 'string')}
                        className="mr-2"
                      />
                      <span className="text-sm">Base64 (recommended)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="newKeyEncoding"
                        value="string"
                        checked={newKeyEncoding === 'string'}
                        onChange={(e) => setNewKeyEncoding(e.target.value as 'base64' | 'string')}
                        className="mr-2"
                      />
                      <span className="text-sm">Plain text</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={saveNewKey}
                    disabled={!newKeyName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Add Key</span>
                  </button>
                  <button
                    onClick={cancelAddNew}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Edit Key Form */}
            {editingKey && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Name</label>
                  <input
                    type="text"
                    value={editingKey.key}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                  <textarea
                    value={editingKey.newValue}
                    onChange={(e) => setEditingKey({ ...editingKey, newValue: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encoding</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="editEncoding"
                        value="base64"
                        checked={editingKey.encoding === 'base64'}
                        onChange={(e) => setEditingKey({ ...editingKey, encoding: e.target.value as 'base64' | 'string' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Base64 (recommended)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="editEncoding"
                        value="string"
                        checked={editingKey.encoding === 'string'}
                        onChange={(e) => setEditingKey({ ...editingKey, encoding: e.target.value as 'base64' | 'string' })}
                        className="mr-2"
                      />
                      <span className="text-sm">Plain text</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Key Details View */}
            {selectedDetails && !editingKey && !addingNew && (
              <div className="space-y-6">
                {/* Raw Base64 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Raw Base64</h4>
                  <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all max-h-32 overflow-y-auto">
                    {selectedDetails.keyData.value}
                  </div>
                </div>

                {/* Decoded Value */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Decoded Value</h4>
                  {revealedValues[selectedKey] ? (
                    <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 break-all max-h-32 overflow-y-auto">
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
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Valid base64:</span>
                      <span className={`text-sm ${selectedDetails.analysis.isValidBase64 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedDetails.analysis.isValidBase64 ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Detected type:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedDetails.analysis.detectedType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Entropy level:</span>
                      <span className={`text-sm capitalize ${
                        selectedDetails.analysis.entropy === 'high' ? 'text-green-600' :
                        selectedDetails.analysis.entropy === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedDetails.analysis.entropy}
                      </span>
                    </div>
                    {selectedDetails.analysis.hasCredentials && (
                      <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-lg">
                        <AlertTriangle size={16} className="text-amber-600" />
                        <span className="text-sm text-amber-700">Contains embedded credentials</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Warnings */}
                {selectedDetails.analysis.warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Security Warnings</h4>
                    <div className="space-y-2">
                      {selectedDetails.analysis.warnings.map((warning, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                          <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                          <span className="text-sm text-red-700">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(selectedKey)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit3 size={16} />
                      <span>Edit Value</span>
                    </button>
                    <button
                      onClick={() => deleteKey(selectedKey)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap component with ErrorBoundary for better error handling
export default function Base64SecretDecoder() {
  return (
    <ErrorBoundary>
      <Base64SecretDecoderComponent />
    </ErrorBoundary>
  );
}