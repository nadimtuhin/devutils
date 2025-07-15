import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { Copy, Download, Upload, FileText, Settings, RefreshCw, Info, Table, FileText as FileTextIcon, WrapText } from 'lucide-react';

interface CsvOptions {
  delimiter: string;
  quotes: boolean;
  header: boolean;
  flattenObjects: boolean;
  arrayDelimiter: string;
}

export default function JsonToCsv() {
  const [jsonInput, setJsonInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [stats, setStats] = useState({ rows: 0, columns: 0 });
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'text' | 'table'>('text');
  const [tableData, setTableData] = useState<any[]>([]);
  const [wrapLines, setWrapLines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [options, setOptions] = useState<CsvOptions>({
    delimiter: ',',
    quotes: true,
    header: true,
    flattenObjects: true,
    arrayDelimiter: ';'
  });

  const sampleData = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "USA"
    },
    "hobbies": ["reading", "swimming"]
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "country": "USA"
    },
    "hobbies": ["painting", "hiking", "cooking"]
  }
]`;

  const flattenObject = (obj: any, prefix = '', arrayDelimiter = ';'): any => {
    const flattened: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] === null || obj[key] === undefined) {
          flattened[newKey] = '';
        } else if (Array.isArray(obj[key])) {
          // Handle arrays by joining with delimiter
          flattened[newKey] = obj[key].map((item: any) => 
            typeof item === 'object' ? JSON.stringify(item) : String(item)
          ).join(arrayDelimiter);
        } else if (typeof obj[key] === 'object') {
          // Recursively flatten nested objects
          Object.assign(flattened, flattenObject(obj[key], newKey, arrayDelimiter));
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };

  const processJsonData = (jsonData: any): any[] => {
    let processedData: any[];

    if (Array.isArray(jsonData)) {
      processedData = jsonData;
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      // Single object - convert to array
      processedData = [jsonData];
    } else {
      throw new Error('JSON must be an object or array of objects');
    }

    if (options.flattenObjects) {
      processedData = processedData.map(item => 
        typeof item === 'object' ? flattenObject(item, '', options.arrayDelimiter) : item
      );
    }

    return processedData;
  };

  const convertToCsv = () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      setCsvOutput('');
      setStats({ rows: 0, columns: 0 });
      return;
    }

    try {
      const jsonData = JSON.parse(jsonInput);
      const processedData = processJsonData(jsonData);
      
      if (processedData.length === 0) {
        throw new Error('No data to convert');
      }

      const csv = Papa.unparse(processedData, {
        delimiter: options.delimiter,
        quotes: options.quotes,
        header: options.header,
        skipEmptyLines: true
      });
      
      setCsvOutput(csv);
      setTableData(processedData);
      setError('');
      
      // Calculate stats
      const lines = csv.split('\n').filter(line => line.trim());
      const columns = lines.length > 0 ? lines[0].split(options.delimiter).length : 0;
      const rows = options.header ? lines.length - 1 : lines.length;
      setStats({ rows, columns });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMessage);
      setCsvOutput('');
      setStats({ rows: 0, columns: 0 });
    }
  };

  // Auto-convert on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (jsonInput.trim()) {
        convertToCsv();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [jsonInput, options]);

  const downloadCsv = () => {
    if (!csvOutput) return;
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted.csv';
    link.click();
  };

  const copyToClipboard = async () => {
    if (!csvOutput) return;
    
    try {
      await navigator.clipboard.writeText(csvOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSampleData = () => {
    setJsonInput(sampleData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
    };
    reader.readAsText(file);
  };

  const clearInput = () => {
    setJsonInput('');
    setCsvOutput('');
    setError('');
    setStats({ rows: 0, columns: 0 });
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">JSON to CSV Converter</h2>
        <p className="text-gray-600">Convert JSON data to CSV format with customizable options</p>
      </div>

      {/* Options Panel */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <Settings size={16} />
          <span>Conversion Options</span>
        </button>
        
        {showOptions && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Delimiter</label>
              <select
                value={options.delimiter}
                onChange={(e) => setOptions({...options, delimiter: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Array Delimiter</label>
              <input
                type="text"
                value={options.arrayDelimiter}
                onChange={(e) => setOptions({...options, arrayDelimiter: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder=";"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.header}
                  onChange={(e) => setOptions({...options, header: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Include Headers</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.quotes}
                  onChange={(e) => setOptions({...options, quotes: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Quote Fields</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.flattenObjects}
                  onChange={(e) => setOptions({...options, flattenObjects: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-xs">Flatten Objects</span>
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
          accept=".json,.txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">JSON Input</label>
            {jsonInput && (
              <span className="text-xs text-gray-500">
                {jsonInput.length} characters
              </span>
            )}
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            style={{ whiteSpace: wrapLines ? 'pre-wrap' : 'pre' }}
            placeholder="Enter JSON data here... (objects, arrays, or nested structures)"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">CSV Output</label>
            <div className="flex items-center space-x-2">
              {stats.rows > 0 && (
                <span className="text-xs text-gray-500">
                  {stats.rows} rows, {stats.columns} columns
                </span>
              )}
              {csvOutput && !error && (
                <div className="flex items-center space-x-2">
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 rounded-md p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('text')}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${
                        viewMode === 'text' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Text view"
                    >
                      <FileTextIcon size={12} />
                      <span>Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${
                        viewMode === 'table' 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Table view"
                    >
                      <Table size={12} />
                      <span>Table</span>
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-1">
                    {viewMode === 'text' && (
                      <button
                        type="button"
                        onClick={() => setWrapLines(!wrapLines)}
                        className={`p-1 ${wrapLines ? 'text-blue-600' : 'text-gray-500'} hover:text-gray-700`}
                        title={wrapLines ? 'Disable line wrapping' : 'Enable line wrapping'}
                      >
                        <WrapText size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copy to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={downloadCsv}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Download CSV"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Output Content */}
          {error ? (
            <textarea
              value={error}
              readOnly
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono text-sm text-red-600"
              placeholder="CSV output will appear here..."
            />
          ) : viewMode === 'text' ? (
            <textarea
              value={csvOutput}
              readOnly
              className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono text-sm"
              style={{ whiteSpace: wrapLines ? 'pre-wrap' : 'pre' }}
              placeholder="CSV output will appear here..."
            />
          ) : (
            <div className="w-full h-96 border border-gray-300 rounded-md shadow-sm bg-white overflow-auto">
              {tableData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {Object.keys(tableData[0]).map((header, index) => (
                        <th
                          key={index}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {Object.values(row).map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0 max-w-xs truncate"
                            title={String(cell)}
                          >
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                  Table view will appear here...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {copied && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">✓ Copied to clipboard!</p>
        </div>
      )}

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
            <p className="font-medium mb-2">Supported JSON formats:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Array of objects: <code>[{"{"}"name": "John"{"}"}, {"{"}"name": "Jane"{"}"}]</code></li>
              <li>Single object: <code>{"{"}"name": "John", "age": 30{"}"}</code></li>
              <li>Nested objects: Objects will be flattened (e.g., <code>address.city</code>)</li>
              <li>Arrays in objects: Will be joined with the specified delimiter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}