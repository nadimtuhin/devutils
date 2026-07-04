import React, { useState, useCallback } from 'react';
import { FileCode, Settings2, Minimize2, Maximize2, CheckSquare, Square } from 'lucide-react';
import { BaseFormatter } from './BaseFormatter';
import { XmlSettings } from '../types/formatters';
import { processXml, defaultXmlSettings, extractXmlNamespaces, analyzeXmlStructure } from '../utils/xmlProcessor';

export default function XmlFormatter() {
  const [settings, setSettings] = useState<XmlSettings>(defaultXmlSettings);
  const [namespaces, setNamespaces] = useState<{ prefix: string; uri: string }[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleProcess = useCallback(async (input: string, currentSettings: XmlSettings) => {
    const result = await processXml(input, currentSettings);
    
    // Extract additional information if processing was successful
    if (result.success && input.trim()) {
      try {
        const xmlNamespaces = extractXmlNamespaces(input);
        setNamespaces(xmlNamespaces);
        
        const xmlAnalysis = analyzeXmlStructure(input);
        setAnalysis(xmlAnalysis);
      } catch (error) {
        // Don't fail the whole process if analysis fails
        setNamespaces([]);
        setAnalysis(null);
      }
    } else {
      setNamespaces([]);
      setAnalysis(null);
    }
    
    return result;
  }, []);

  const renderSettings = useCallback((currentSettings: XmlSettings, onChange: (settings: XmlSettings) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Indentation Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indent Size
          </label>
          <select
            value={currentSettings.indentSize}
            onChange={(e) => onChange({ ...currentSettings, indentSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>

        {/* Minify Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Output Format
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, minify: false })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                !currentSettings.minify 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Maximize2 size={16} />
              <span>Formatted</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, minify: true })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentSettings.minify 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Minimize2 size={16} />
              <span>Minified</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, preserveComments: !currentSettings.preserveComments })}
              className="flex items-center space-x-2 text-sm"
            >
              {currentSettings.preserveComments ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              <span>Preserve Comments</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, preserveWhitespace: !currentSettings.preserveWhitespace })}
              className="flex items-center space-x-2 text-sm"
            >
              {currentSettings.preserveWhitespace ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              <span>Preserve Whitespace</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, sortAttributes: !currentSettings.sortAttributes })}
              className="flex items-center space-x-2 text-sm"
            >
              {currentSettings.sortAttributes ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              <span>Sort Attributes</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, validateSchema: !currentSettings.validateSchema })}
              className="flex items-center space-x-2 text-sm"
            >
              {currentSettings.validateSchema ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              <span>Validate Schema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ), []);

  return (
    <BaseFormatter
      title="XML Formatter"
      description="Format, validate, and minify XML documents with namespace support and error detection."
      placeholder="Paste your XML content here..."
      settings={settings}
      onSettingsChange={setSettings}
      onProcess={handleProcess}
      renderSettings={renderSettings}
    >
      {/* Additional Information Panels */}
      <div className="mt-8 space-y-6">
        {/* XML Analysis */}
        {analysis && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileCode size={20} className="mr-2" />
              XML Analysis
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Lines:</span>
                <span className="ml-2 font-medium">{analysis.lineCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Characters:</span>
                <span className="ml-2 font-medium">{analysis.characterCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Elements:</span>
                <span className="ml-2 font-medium">{analysis.structure?.elements || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Max Depth:</span>
                <span className="ml-2 font-medium">{analysis.structure?.depth || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Attributes:</span>
                <span className="ml-2 font-medium">{analysis.structure?.attributes || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Encoding:</span>
                <span className="ml-2 font-medium">{analysis.encoding}</span>
              </div>
            </div>
          </div>
        )}

        {/* Namespaces */}
        {namespaces.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              XML Namespaces
            </h3>
            <div className="space-y-2">
              {namespaces.map((ns, index) => (
                <div key={index} className="flex items-center space-x-4 text-sm">
                  <span className="font-medium text-blue-800 min-w-20">
                    {ns.prefix}:
                  </span>
                  <span className="text-blue-600 font-mono break-all">
                    {ns.uri}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            XML Formatting Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use <strong>Formatted</strong> mode for readable, indented XML</li>
            <li>• Use <strong>Minified</strong> mode to reduce file size for production</li>
            <li>• Enable <strong>Sort Attributes</strong> for consistent attribute ordering</li>
            <li>• <strong>Preserve Comments</strong> keeps XML comments in the output</li>
            <li>• <strong>Preserve Whitespace</strong> maintains original spacing in text content</li>
            <li>• The formatter automatically detects and preserves XML namespaces</li>
          </ul>
        </div>
      </div>
    </BaseFormatter>
  );
}