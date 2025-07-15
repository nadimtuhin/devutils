import { useState, useRef, useEffect } from 'react';
import { Copy, Download, RefreshCw, Settings } from 'lucide-react';

const PhpJsonConverter = () => {
  const [phpCode, setPhpCode] = useState('');
  const [jsonCode, setJsonCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [options, setOptions] = useState({
    phpArraySyntax: 'array', // 'array' or 'bracket'
    jsonIndent: 2,
    phpIndent: 2,
    preserveNumericKeys: false,
    sortKeys: false
  });
  const [showOptions, setShowOptions] = useState(false);
  const phpTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [phpScrollTop, setPhpScrollTop] = useState(0);
  const [jsonScrollTop, setJsonScrollTop] = useState(0);

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError(message);
      setSuccess('');
    }
  };

  const parsePhpArray = (input: string): any => {
    // Remove PHP opening/closing tags and whitespace
    let cleaned = input.trim()
      .replace(/^<\?php\s*/i, '')
      .replace(/\?\>$/i, '')
      .replace(/^\$\w+\s*=\s*/, '') // Remove variable assignment
      .replace(/;$/, ''); // Remove trailing semicolon

    // Tokenize the input to properly handle nested structures
    const tokens = tokenizePhp(cleaned);
    return parseTokens(tokens);
  };

  const tokenizePhp = (input: string): string[] => {
    const tokens: string[] = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    let i = 0;

    while (i < input.length) {
      const char = input[i];
      const nextChar = input[i + 1];

      if (!inString) {
        // Handle array() syntax
        if (input.substr(i, 5).toLowerCase() === 'array') {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          tokens.push('array');
          i += 5;
          continue;
        }

        // Handle special characters
        if (['(', ')', '[', ']', ',', '=>'].includes(char) || 
            (char === '=' && nextChar === '>')) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          if (char === '=' && nextChar === '>') {
            tokens.push('=>');
            i += 2;
            continue;
          } else {
            tokens.push(char);
          }
        }
        // Handle strings
        else if (char === '"' || char === "'") {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
          inString = true;
          stringChar = char;
          current = char;
        }
        // Handle whitespace
        else if (char.match(/\s/)) {
          if (current.trim()) {
            tokens.push(current.trim());
            current = '';
          }
        }
        // Regular characters
        else {
          current += char;
        }
      } else {
        current += char;
        // Handle escaped quotes
        if (char === '\\' && nextChar) {
          current += nextChar;
          i++;
        }
        // End of string
        else if (char === stringChar) {
          tokens.push(current);
          current = '';
          inString = false;
          stringChar = '';
        }
      }
      i++;
    }

    if (current.trim()) {
      tokens.push(current.trim());
    }

    return tokens.filter(token => token.length > 0);
  };

  const parseTokens = (tokens: string[]): any => {
    let index = 0;

    const parseValue = (): any => {
      if (index >= tokens.length) return null;

      const token = tokens[index];

      // Handle array syntax
      if (token === 'array' || token === '[') {
        index++; // Skip 'array' or '['
        if (tokens[index] === '(' || tokens[index] === '[') {
          index++; // Skip opening bracket
        }
        
        const result: any = {};
        let arrayIndex = 0;
        let isNumericArray = true;

        while (index < tokens.length && tokens[index] !== ')' && tokens[index] !== ']') {
          if (tokens[index] === ',') {
            index++;
            continue;
          }

          let key: string | number;
          let value: any;

          // Check if we have a key => value pair
          if (index + 2 < tokens.length && tokens[index + 1] === '=>') {
            key = parseValue();
            index++; // Skip '=>'
            value = parseValue();
            isNumericArray = false;
          } else {
            key = arrayIndex++;
            value = parseValue();
          }

          if (typeof key === 'string' && key.startsWith('"') && key.endsWith('"')) {
            key = key.slice(1, -1);
          } else if (typeof key === 'string' && key.startsWith("'") && key.endsWith("'")) {
            key = key.slice(1, -1);
          }

          result[key] = value;
        }

        if (index < tokens.length) {
          index++; // Skip closing bracket
        }

        // Convert to array if it's a numeric array
        if (isNumericArray) {
          const arr = [];
          for (let i = 0; i < arrayIndex; i++) {
            arr[i] = result[i];
          }
          return arr;
        }

        return result;
      }

      // Handle strings
      if (token.startsWith('"') && token.endsWith('"')) {
        index++;
        return token.slice(1, -1);
      }
      if (token.startsWith("'") && token.endsWith("'")) {
        index++;
        return token.slice(1, -1);
      }

      // Handle numbers
      if (/^-?\d+(\.\d+)?$/.test(token)) {
        index++;
        return parseFloat(token);
      }

      // Handle booleans and null
      if (token.toLowerCase() === 'true') {
        index++;
        return true;
      }
      if (token.toLowerCase() === 'false') {
        index++;
        return false;
      }
      if (token.toLowerCase() === 'null') {
        index++;
        return null;
      }

      // Handle unquoted strings (keys)
      index++;
      return token;
    };

    return parseValue();
  };

  const convertToPhpArray = (obj: any, indent: number = 0): string => {
    const indentStr = ' '.repeat(indent);
    const nextIndentStr = ' '.repeat(indent + options.phpIndent);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return options.phpArraySyntax === 'array' ? 'array()' : '[]';
      
      const items = obj.map((item, index) => {
        const value = typeof item === 'object' ? convertToPhpArray(item, indent + options.phpIndent) : formatPhpValue(item);
        return options.preserveNumericKeys ? `${nextIndentStr}${index} => ${value}` : `${nextIndentStr}${value}`;
      });
      
      if (options.phpArraySyntax === 'array') {
        return `array(\n${items.join(',\n')}\n${indentStr})`;
      } else {
        return `[\n${items.join(',\n')}\n${indentStr}]`;
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const keys = options.sortKeys ? Object.keys(obj).sort() : Object.keys(obj);
      if (keys.length === 0) return options.phpArraySyntax === 'array' ? 'array()' : '[]';
      
      const items = keys.map(key => {
        const value = typeof obj[key] === 'object' ? convertToPhpArray(obj[key], indent + options.phpIndent) : formatPhpValue(obj[key]);
        return `${nextIndentStr}'${key}' => ${value}`;
      });
      
      if (options.phpArraySyntax === 'array') {
        return `array(\n${items.join(',\n')}\n${indentStr})`;
      } else {
        return `[\n${items.join(',\n')}\n${indentStr}]`;
      }
    }
    
    return formatPhpValue(obj);
  };

  const formatPhpValue = (value: any): string => {
    if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (value === null) return 'null';
    return String(value);
  };

  const convertPhpToJson = (input: string) => {
    try {
      setPhpCode(input);
      if (!input.trim()) {
        setJsonCode('');
        setError('');
        return;
      }

      const parsed = parsePhpArray(input);
      const formatted = JSON.stringify(parsed, null, options.jsonIndent);
      setJsonCode(formatted);
      setError('');
    } catch (err) {
      setError(`Invalid PHP array format: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const convertJsonToPhp = (input: string) => {
    try {
      setJsonCode(input);
      if (!input.trim()) {
        setPhpCode('');
        setError('');
        return;
      }

      const parsed = JSON.parse(input);
      const phpArray = convertToPhpArray(parsed);
      setPhpCode(phpArray);
      setError('');
    } catch (err) {
      setError(`Invalid JSON format: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage(`${type} copied to clipboard!`, 'success');
    } catch (err) {
      showMessage('Failed to copy to clipboard', 'error');
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMessage(`${filename} downloaded!`, 'success');
  };

  const clearAll = () => {
    setPhpCode('');
    setJsonCode('');
    setError('');
    setSuccess('');
  };

  const loadExample = () => {
    const examplePhp = `array(
    'name' => 'John Doe',
    'age' => 30,
    'email' => 'john@example.com',
    'skills' => array('PHP', 'JavaScript', 'Python'),
    'address' => array(
        'street' => '123 Main St',
        'city' => 'New York',
        'country' => 'USA'
    ),
    'active' => true,
    'score' => null
)`;
    convertPhpToJson(examplePhp);
  };

  const getLineNumbers = (text: string) => {
    const lines = text.split('\n');
    return Array.from({ length: lines.length }, (_, i) => i + 1);
  };

  const handlePhpScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setPhpScrollTop(e.currentTarget.scrollTop);
  };

  const handleJsonScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    setJsonScrollTop(e.currentTarget.scrollTop);
  };

  const CodeEditor = ({ 
    value, 
    onChange, 
    placeholder, 
    scrollTop, 
    onScroll, 
    textareaRef 
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    scrollTop: number;
    onScroll: (e: React.UIEvent<HTMLTextAreaElement>) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
  }) => {
    const lineNumbers = getLineNumbers(value || '1');
    
    return (
      <div className="relative border rounded-lg overflow-hidden bg-white">
        <div className="flex">
          {/* Line numbers */}
          <div 
            className="bg-gray-50 border-r border-gray-200 px-2 py-4 font-mono text-sm text-gray-500 select-none min-w-[3rem] text-right"
            style={{ 
              transform: `translateY(-${scrollTop}px)`,
              lineHeight: '1.5',
              fontSize: '14px'
            }}
          >
            {lineNumbers.map(num => (
              <div key={num} className="leading-6">
                {num}
              </div>
            ))}
          </div>
          
          {/* Code textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onScroll={onScroll}
            className="flex-1 h-[60vh] p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none border-0"
            style={{ 
              lineHeight: '1.5',
              fontSize: '14px'
            }}
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PHP ↔ JSON Converter</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Settings size={16} />
            Options
          </button>
          <button
            onClick={loadExample}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
          >
            Load Example
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
          >
            <RefreshCw size={16} />
            Clear
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h3 className="font-medium mb-3">Conversion Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PHP Array Syntax
              </label>
              <select
                value={options.phpArraySyntax}
                onChange={(e) => setOptions({...options, phpArraySyntax: e.target.value as 'array' | 'bracket'})}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="array">array()</option>
                <option value="bracket">[]</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                JSON Indent
              </label>
              <select
                value={options.jsonIndent}
                onChange={(e) => setOptions({...options, jsonIndent: parseInt(e.target.value)})}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="0">Minified</option>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PHP Indent
              </label>
              <select
                value={options.phpIndent}
                onChange={(e) => setOptions({...options, phpIndent: parseInt(e.target.value)})}
                className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="preserveNumericKeys"
                checked={options.preserveNumericKeys}
                onChange={(e) => setOptions({...options, preserveNumericKeys: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="preserveNumericKeys" className="text-sm text-gray-700">
                Preserve numeric keys
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sortKeys"
                checked={options.sortKeys}
                onChange={(e) => setOptions({...options, sortKeys: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="sortKeys" className="text-sm text-gray-700">
                Sort object keys
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              PHP Array
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => copyToClipboard(phpCode, 'PHP')}
                disabled={!phpCode}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Copy size={12} />
                Copy
              </button>
              <button
                onClick={() => downloadFile(phpCode, 'array.php')}
                disabled={!phpCode}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          </div>
          <CodeEditor
            value={phpCode}
            onChange={(e) => convertPhpToJson(e.target.value)}
            placeholder="Enter PHP array syntax:
array('key' => 'value')
or
['key' => 'value']

Supports:
• Nested arrays
• Mixed data types
• Boolean/null values
• Variable assignments
• PHP tags"
            scrollTop={phpScrollTop}
            onScroll={handlePhpScroll}
            textareaRef={phpTextareaRef}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              JSON
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => copyToClipboard(jsonCode, 'JSON')}
                disabled={!jsonCode}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Copy size={12} />
                Copy
              </button>
              <button
                onClick={() => downloadFile(jsonCode, 'data.json')}
                disabled={!jsonCode}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          </div>
          <CodeEditor
            value={jsonCode}
            onChange={(e) => convertJsonToPhp(e.target.value)}
            placeholder='Enter valid JSON:
{"key": "value"}

Supports:
• Objects and arrays
• All JSON data types
• Nested structures
• Unicode characters'
            scrollTop={jsonScrollTop}
            onScroll={handleJsonScroll}
            textareaRef={jsonTextareaRef}
          />
        </div>
      </div>

      {(error || success) && (
        <div className="flex items-center justify-between">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">
              <span>⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <span>✅</span>
              {success}
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
          <div>• Supports both array() and [] syntax</div>
          <div>• Handles nested arrays and objects</div>
          <div>• Preserves data types (bool, null, numbers)</div>
          <div>• Configurable indentation and formatting</div>
          <div>• Copy and download functionality</div>
          <div>• Real-time bidirectional conversion</div>
          <div>• PHP variable assignment parsing</div>
          <div>• Automatic PHP tag removal</div>
        </div>
      </div>
    </div>
  );
};

export default PhpJsonConverter; 
