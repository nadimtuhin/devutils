import React, { useState, useEffect, useRef } from 'react';
import yaml from 'js-yaml';
import { Download, Copy, RotateCcw, FileText } from 'lucide-react';

// Line-numbered text area component
interface LineNumberedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onCopy?: () => void;
  copySuccess?: boolean;
}

function LineNumberedTextArea({ value, onChange, placeholder, className = '', onCopy, copySuccess }: LineNumberedTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className={`relative flex border border-gray-300 rounded-md shadow-sm ${className}`}>
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 bg-gray-100 border-r border-gray-300 overflow-hidden text-right pr-2 py-2 font-mono text-sm text-gray-500 select-none"
        style={{ height: '384px' }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Text area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        className="flex-1 px-3 py-2 border-0 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none outline-none"
        placeholder={placeholder}
        style={{ height: '384px' }}
      />
    </div>
  );
}

// Line-numbered pre component
interface LineNumberedPreProps {
  content: string;
  error?: boolean;
  className?: string;
}

function LineNumberedPre({ content, error = false, className = '' }: LineNumberedPreProps) {
  const lines = content.split('\n');
  const lineCount = Math.max(lines.length, 1);

  return (
    <div className={`relative flex border border-gray-300 rounded-md overflow-hidden ${className}`}>
      {/* Line numbers */}
      <div className="flex-shrink-0 w-12 bg-gray-100 border-r border-gray-300 text-right pr-2 py-2 font-mono text-sm text-gray-500 select-none">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="leading-5">
            {i + 1}
          </div>
        ))}
      </div>
      
      {/* Content */}
      <pre
        className={`flex-1 px-3 py-2 overflow-auto font-mono text-sm ${
          error ? 'text-red-600 bg-red-50' : 'bg-gray-50'
        }`}
        style={{ height: '384px' }}
      >
        {content}
      </pre>
    </div>
  );
}

export default function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'yaml-to-json' | 'json-to-yaml'>('yaml-to-json');
  const [indentSize, setIndentSize] = useState(2);
  const [copySuccess, setCopySuccess] = useState(false);
  const [inputCopySuccess, setInputCopySuccess] = useState(false);

  const sampleYaml = `# Sample YAML data
name: John Doe
age: 30
address:
  street: 123 Main St
  city: New York
  country: USA
hobbies:
  - reading
  - swimming
  - coding
active: true
metadata:
  created: 2024-01-01
  updated: 2024-01-15`;

  const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": [
    "reading",
    "swimming",
    "coding"
  ],
  "active": true,
  "metadata": {
    "created": "2024-01-01",
    "updated": "2024-01-15"
  }
}`;

  const convert = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (mode === 'yaml-to-json') {
        const parsed = yaml.load(input);
        setOutput(JSON.stringify(parsed, null, indentSize));
      } else {
        const parsed = JSON.parse(input);
        setOutput(yaml.dump(parsed, { 
          indent: indentSize,
          lineWidth: -1,
          noRefs: true,
          sortKeys: false
        }));
      }
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        `Invalid ${mode === 'yaml-to-json' ? 'YAML' : 'JSON'}`;
      setError(errorMessage);
      setOutput('');
    }
  };

  // Real-time conversion
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convert();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input, mode, indentSize]);

  const handleCopy = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInputCopy = async () => {
    if (!input) return;
    
    try {
      await navigator.clipboard.writeText(input);
      setInputCopySuccess(true);
      setTimeout(() => setInputCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy input:', err);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    
    const fileExtension = mode === 'yaml-to-json' ? 'json' : 'yaml';
    const mimeType = mode === 'yaml-to-json' ? 'application/json' : 'text/yaml';
    
    const blob = new Blob([output], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `converted.${fileExtension}`;
    link.click();
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const loadSample = () => {
    setInput(mode === 'yaml-to-json' ? sampleYaml : sampleJson);
  };

  const inputLabel = mode === 'yaml-to-json' ? 'YAML Input' : 'JSON Input';
  const outputLabel = mode === 'yaml-to-json' ? 'JSON Output' : 'YAML Output';
  const inputPlaceholder = mode === 'yaml-to-json' ? 'Enter YAML here...' : 'Enter JSON here...';

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">YAML ↔ JSON Converter</h2>
      
      {/* Mode Selection and Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setMode('yaml-to-json')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'yaml-to-json'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            YAML → JSON
          </button>
          <button
            type="button"
            onClick={() => setMode('json-to-yaml')}
            className={`px-4 py-2 rounded-md transition-colors ${
              mode === 'json-to-yaml'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            JSON → YAML
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Indent:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>

        <button
          type="button"
          onClick={loadSample}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FileText size={16} />
          <span>Load Sample</span>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RotateCcw size={16} />
          <span>Clear</span>
        </button>
      </div>

      {/* Input/Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">{inputLabel}</label>
            <button
              type="button"
              onClick={handleInputCopy}
              disabled={!input}
              className={`flex items-center space-x-1 px-2 py-1 text-xs border rounded transition-colors ${
                !input 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : inputCopySuccess
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
              title="Copy input to clipboard"
            >
              <Copy size={12} />
              <span>{inputCopySuccess ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <LineNumberedTextArea
            value={input}
            onChange={setInput}
            placeholder={inputPlaceholder}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">{outputLabel}</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!output || !!error}
                className={`flex items-center space-x-1 px-2 py-1 text-xs border rounded transition-colors ${
                  (!output || !!error) 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : copySuccess
                    ? 'bg-green-100 text-green-700 border-green-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                title="Copy to clipboard"
              >
                <Copy size={12} />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!output || !!error}
                className={`flex items-center space-x-1 px-2 py-1 text-xs border rounded transition-colors ${
                  (!output || !!error) 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
                title="Download file"
              >
                <Download size={12} />
                <span>Download</span>
              </button>
            </div>
          </div>
          <LineNumberedPre
            content={error || output || (input ? 'Converting...' : `Converted ${outputLabel.toLowerCase()} will appear here`)}
            error={!!error}
            className="w-full"
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Features:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Real-time conversion as you type</li>
          <li>• Bidirectional conversion (YAML ↔ JSON)</li>
          <li>• Configurable indentation (2, 4, or 8 spaces)</li>
          <li>• Copy to clipboard and download functionality</li>
          <li>• Sample data for quick testing</li>
          <li>• Comprehensive error handling and validation</li>
        </ul>
      </div>
    </div>
  );
}