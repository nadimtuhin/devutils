import React, { useState, useCallback } from 'react';
import { FileCode, Settings2, ArrowRightLeft, CheckSquare, Square } from 'lucide-react';
import { BaseFormatter } from './BaseFormatter';
import { TomlSettings } from '../types/formatters';
import { processToml, defaultTomlSettings, extractTomlSections, extractTomlArrayTables, analyzeTomlStructure } from '../utils/tomlProcessor';

export default function TomlFormatter() {
  const [settings, setSettings] = useState<TomlSettings>(defaultTomlSettings);
  const [sections, setSections] = useState<string[]>([]);
  const [arrayTables, setArrayTables] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleProcess = useCallback(async (input: string, currentSettings: TomlSettings) => {
    const result = await processToml(input, currentSettings);
    
    // Extract additional information if processing was successful
    if (result.success && input.trim()) {
      try {
        const tomlSections = extractTomlSections(input);
        setSections(tomlSections);
        
        const tomlArrayTables = extractTomlArrayTables(input);
        setArrayTables(tomlArrayTables);
        
        const tomlAnalysis = analyzeTomlStructure(input);
        setAnalysis(tomlAnalysis);
      } catch (error) {
        // Don't fail the whole process if analysis fails
        setSections([]);
        setArrayTables([]);
        setAnalysis(null);
      }
    } else {
      setSections([]);
      setArrayTables([]);
      setAnalysis(null);
    }
    
    return result;
  }, []);

  const renderSettings = useCallback((currentSettings: TomlSettings, onChange: (settings: TomlSettings) => void) => (
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

        {/* Output Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Output Format
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, convertToJson: false })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                !currentSettings.convertToJson 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileCode size={16} />
              <span>TOML</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, convertToJson: true })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                currentSettings.convertToJson 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowRightLeft size={16} />
              <span>JSON</span>
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
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onChange({ ...currentSettings, sortKeys: !currentSettings.sortKeys })}
              className="flex items-center space-x-2 text-sm"
            >
              {currentSettings.sortKeys ? (
                <CheckSquare size={16} className="text-blue-600" />
              ) : (
                <Square size={16} className="text-gray-400" />
              )}
              <span>Sort Keys</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ), []);

  return (
    <BaseFormatter
      title="TOML Formatter"
      description="Format, validate, and convert TOML configuration files with support for tables, arrays, and JSON conversion."
      placeholder="Paste your TOML content here..."
      settings={settings}
      onSettingsChange={setSettings}
      onProcess={handleProcess}
      renderSettings={renderSettings}
    >
      {/* Additional Information Panels */}
      <div className="mt-8 space-y-6">
        {/* TOML Analysis */}
        {analysis && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FileCode size={20} className="mr-2" />
              TOML Analysis
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
                <span className="text-gray-600">Tables:</span>
                <span className="ml-2 font-medium">{analysis.structure?.tables || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Keys:</span>
                <span className="ml-2 font-medium">{analysis.structure?.keys || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Arrays:</span>
                <span className="ml-2 font-medium">{analysis.structure?.arrays || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Max Depth:</span>
                <span className="ml-2 font-medium">{analysis.structure?.depth || 0}</span>
              </div>
            </div>
          </div>
        )}

        {/* TOML Sections */}
        {sections.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              TOML Tables
            </h3>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono"
                >
                  [{section}]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TOML Array Tables */}
        {arrayTables.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              TOML Array Tables
            </h3>
            <div className="flex flex-wrap gap-2">
              {arrayTables.map((arrayTable, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-mono"
                >
                  [[{arrayTable}]]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            TOML Formatting Tips
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Use <strong>TOML</strong> output to format and organize your configuration</li>
            <li>• Use <strong>JSON</strong> output to convert TOML to JSON format</li>
            <li>• Enable <strong>Sort Keys</strong> for consistent key ordering</li>
            <li>• <strong>Preserve Comments</strong> keeps TOML comments in the output</li>
            <li>• Tables are shown as <code>[table.name]</code> sections</li>
            <li>• Array tables are shown as <code>[[array.table]]</code> sections</li>
            <li>• TOML supports nested tables, arrays, and various data types</li>
          </ul>
        </div>

        {/* TOML Examples */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            TOML Examples
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Basic Configuration:</h4>
              <pre className="bg-white p-2 rounded border font-mono text-xs overflow-x-auto">
{`title = "My App"
version = "1.0.0"
debug = true

[database]
host = "localhost"
port = 5432`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Array Tables:</h4>
              <pre className="bg-white p-2 rounded border font-mono text-xs overflow-x-auto">
{`[[servers]]
name = "web1"
ip = "192.168.1.1"

[[servers]]
name = "web2"
ip = "192.168.1.2"`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </BaseFormatter>
  );
}