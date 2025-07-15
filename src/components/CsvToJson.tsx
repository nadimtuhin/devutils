import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Copy, Download, Upload, FileText, Settings, RefreshCw, Info, Check } from 'lucide-react';

interface CsvOptions {
  delimiter: string;
  header: boolean;
  skipEmptyLines: boolean;
  trimHeaders: boolean;
  dynamicTyping: boolean;
}

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [stats, setStats] = useState({ rows: 0, columns: 0 });
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<CsvOptions>({
    delimiter: ',',
    header: true,
    skipEmptyLines: true,
    trimHeaders: true,
    dynamicTyping: true
  });

  const sampleData = `name,email,age,city,country
John Doe,john@example.com,30,New York,USA
Jane Smith,jane@example.com,25,Los Angeles,USA
Bob Johnson,bob@example.com,35,Chicago,USA
Alice Brown,alice@example.com,28,Houston,USA`;

  const convertToJson = () => {
    if (!csvInput.trim()) {
      setError('Please enter CSV data');
      setJsonOutput('');
      setStats({ rows: 0, columns: 0 });
      return;
    }

    try {
      Papa.parse(csvInput, {
        header: options.header,
        delimiter: options.delimiter,
        skipEmptyLines: options.skipEmptyLines,
        trimHeaders: options.trimHeaders,
        dynamicTyping: options.dynamicTyping,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(results.errors[0].message);
            setJsonOutput('');
            setStats({ rows: 0, columns: 0 });
            return;
          }
          
          const jsonData = results.data;
          setJsonOutput(JSON.stringify(jsonData, null, 2));
          setError('');
          
          // Calculate stats
          const rows = Array.isArray(jsonData) ? jsonData.length : 0;
          const columns = rows > 0 && typeof jsonData[0] === 'object' ? Object.keys(jsonData[0]).length : 0;
          setStats({ rows, columns });
        },
        error: (err) => {
          setError(err.message);
          setJsonOutput('');
          setStats({ rows: 0, columns: 0 });
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid CSV');
      setJsonOutput('');
      setStats({ rows: 0, columns: 0 });
    }
  };

  // Auto-convert on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (csvInput.trim()) {
        convertToJson();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [csvInput, options]);

  const downloadJson = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted.json';
    link.click();
  };

  const copyToClipboard = async () => {
    if (!jsonOutput) return;
    
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSampleData = () => {
    setCsvInput(sampleData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvInput(content);
    };
    reader.readAsText(file);
  };

  const clearInput = () => {
    setCsvInput('');
    setJsonOutput('');
    setError('');
    setStats({ rows: 0, columns: 0 });
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">CSV to JSON Converter</h2>
        <p className="text-gray-600">Convert CSV data to JSON format with customizable parsing options</p>
      </div>

      {/* Options Panel */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Settings size={16} />
          <span>Parsing Options</span>
        </button>
        
        {showOptions && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Delimiter</label>
              <select
                value={options.delimiter}
                onChange={(e) => setOptions({...options, delimiter: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                title="CSV field delimiter"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.header}
                  onChange={(e) => setOptions({...options, header: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">First Row as Headers</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.skipEmptyLines}
                  onChange={(e) => setOptions({...options, skipEmptyLines: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Skip Empty Lines</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.trimHeaders}
                  onChange={(e) => setOptions({...options, trimHeaders: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Trim Headers</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.dynamicTyping}
                  onChange={(e) => setOptions({...options, dynamicTyping: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Auto-detect Types</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={loadSampleData}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <FileText size={16} />
          <span>Load Sample</span>
        </button>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <Upload size={16} />
          <span>Upload File</span>
        </button>
        
        <button
          type="button"
          onClick={clearInput}
          className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          <RefreshCw size={16} />
          <span>Clear</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">CSV Input</label>
            {csvInput && (
              <span className="text-xs text-gray-500">
                {csvInput.length} characters
              </span>
            )}
          </div>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter CSV data here... (comma-separated values with optional headers)"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">JSON Output</label>
            <div className="flex items-center space-x-2">
              {stats.rows > 0 && (
                <span className="text-xs text-gray-500">
                  {stats.rows} records, {stats.columns} fields
                </span>
              )}
              {jsonOutput && !error && (
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 p-1 text-gray-500 hover:text-gray-700"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={downloadJson}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    title="Download JSON"
                  >
                    <Download size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <textarea
            value={error || jsonOutput}
            readOnly
            className={`w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono text-sm ${
              error ? 'text-red-600' : ''
            }`}
            placeholder="JSON output will appear here..."
          />
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">CSV parsing features:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Automatic delimiter detection or manual selection</li>
              <li>Header row support for object property names</li>
              <li>Type detection (numbers, booleans, null values)</li>
              <li>Empty line and whitespace handling</li>
              <li>Support for quoted fields with embedded commas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Copy size={16} />
          <span>Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}