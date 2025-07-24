import React, { useState } from 'react';
import { Copy, RotateCcw, ArrowLeftRight, FileText } from 'lucide-react';

const PhpSerializer = () => {
  const [serialized, setSerialized] = useState('');
  const [unserialized, setUnserialized] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'serialize' | 'unserialize'>('serialize');

  // Enhanced PHP serialization format implementation with references
  const referenceMap = new Map<any, number>();
  const referenceCounter = { count: 1 };

  // PHP Array/Object Syntax Parser
  const parsePhpSyntax = (phpCode: string): any => {
    // Remove whitespace and comments
    let code = phpCode.trim().replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    
    // Handle different PHP array syntaxes
    if (code === '' || code === 'null') {
      return null;
    }
    if (code === 'true') {
      return true;
    }
    if (code === 'false') {
      return false;
    }
    
    // Handle numbers
    if (/^-?\d+$/.test(code)) {
      return parseInt(code, 10);
    }
    if (/^-?\d*\.\d+$/.test(code)) {
      return parseFloat(code);
    }
    
    // Handle special float constants
    if (code === 'INF') {
      return Infinity;
    }
    if (code === '-INF') {
      return -Infinity;
    }
    if (code === 'NAN') {
      return NaN;
    }
    
    // Handle strings
    if ((code.startsWith("'") && code.endsWith("'")) || (code.startsWith('"') && code.endsWith('"'))) {
      return code.slice(1, -1).replace(/\\'/g, "'").replace(/\\\\/g, '\\').replace(/\\"/g, '"');
    }
    
    // Handle arrays - both array() and [] syntax
    if (code.startsWith('array(') && code.endsWith(')')) {
      const innerCode = code.slice(6, -1).trim();
      return parsePhpArray(innerCode);
    }
    if (code.startsWith('[') && code.endsWith(']')) {
      const innerCode = code.slice(1, -1).trim();
      return parsePhpArray(innerCode);
    }
    
    // Handle objects with new ClassName() syntax
    const objectMatch = code.match(/^new\s+(\w+)\s*\((.*)\)$/s);
    if (objectMatch) {
      const className = objectMatch[1];
      const props = parsePhpArray(objectMatch[2]);
      return { __class: className, ...props };
    }
    
    throw new Error(`Unable to parse PHP syntax: ${code.slice(0, 50)}...`);
  };
  
  const parsePhpArray = (innerCode: string): any => {
    if (!innerCode.trim()) {
      return [];
    }
    
    const result: any = {};
    const items = splitPhpArrayItems(innerCode);
    let isSequential = true;
    let expectedIndex = 0;
    
    for (const item of items) {
      const arrowIndex = findPhpArrowOperator(item);
      
      if (arrowIndex !== -1) {
        // Key-value pair
        const keyPart = item.slice(0, arrowIndex).trim();
        const valuePart = item.slice(arrowIndex + 2).trim();
        
        const key = parsePhpSyntax(keyPart);
        const value = parsePhpSyntax(valuePart);
        result[key] = value;
        
        if (typeof key !== 'number' || key !== expectedIndex) {
          isSequential = false;
        }
      } else {
        // Sequential item
        const value = parsePhpSyntax(item.trim());
        result[expectedIndex] = value;
      }
      expectedIndex++;
    }
    
    // Convert to array if sequential
    if (isSequential && Object.keys(result).length > 0) {
      const arr = [];
      for (let i = 0; i < Object.keys(result).length; i++) {
        arr[i] = result[i];
      }
      return arr;
    }
    
    return result;
  };
  
  const splitPhpArrayItems = (code: string): string[] => {
    const items: string[] = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const prev = i > 0 ? code[i - 1] : '';
      
      if (!inString) {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '[' || char === '(') {
          depth++;
        } else if (char === ']' || char === ')') {
          depth--;
        } else if (char === ',' && depth === 0) {
          items.push(current.trim());
          current = '';
          continue;
        }
      } else {
        if (char === stringChar && prev !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      items.push(current.trim());
    }
    
    return items;
  };
  
  const findPhpArrowOperator = (code: string): number => {
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < code.length - 1; i++) {
      const char = code[i];
      const next = code[i + 1];
      const prev = i > 0 ? code[i - 1] : '';
      
      if (!inString) {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
        } else if (char === '[' || char === '(') {
          depth++;
        } else if (char === ']' || char === ')') {
          depth--;
        } else if (char === '=' && next === '>' && depth === 0) {
          return i;
        }
      } else {
        if (char === stringChar && prev !== '\\') {
          inString = false;
          stringChar = '';
        }
      }
    }
    
    return -1;
  };
  
  // PHP Array/Object Syntax Generator
  const generatePhpSyntax = (value: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (typeof value === 'number') {
      if (value === Infinity) {
        return 'INF';
      }
      if (value === -Infinity) {
        return '-INF';
      }
      if (Number.isNaN(value)) {
        return 'NAN';
      }
      return value.toString();
    }
    if (typeof value === 'string') {
      // Escape single quotes and backslashes
      const escaped = value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      return `'${escaped}'`;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return '[]';
      }
      
      const items = value.map((item, index) => {
        const itemValue = generatePhpSyntax(item, indent + 1);
        return `${spaces}  ${itemValue}`;
      });
      
      return `[\n${items.join(',\n')}\n${spaces}]`;
    }
    
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value);
      
      if (entries.length === 0) {
        return '[]';
      }
      
      // Check if it's a PHP object
      if (value.__class && typeof value.__class === 'string') {
        const className = value.__class;
        const props = entries.filter(([k]) => k !== '__class');
        
        if (props.length === 0) {
          return `new ${className}([])`;
        }
        
        const propItems = props.map(([key, val]) => {
          const keyStr = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? key : generatePhpSyntax(key);
          const valueStr = generatePhpSyntax(val, indent + 1);
          return `${spaces}  ${keyStr} => ${valueStr}`;
        });
        
        return `new ${className}([\n${propItems.join(',\n')}\n${spaces}])`;
      }
      
      // Regular associative array
      const items = entries.map(([key, val]) => {
        const keyStr = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) ? `'${key}'` : generatePhpSyntax(key);
        const valueStr = generatePhpSyntax(val, indent + 1);
        return `${spaces}  ${keyStr} => ${valueStr}`;
      });
      
      return `[\n${items.join(',\n')}\n${spaces}]`;
    }
    
    throw new Error(`Unsupported type for PHP syntax: ${typeof value}`);
  };

  const serializeValue = (value: any, resetRefs: boolean = false): string => {
    if (resetRefs) {
      referenceMap.clear();
      referenceCounter.count = 1;
    }
    if (value === null || value === undefined) {
      return 'N;';
    }
    if (typeof value === 'boolean') {
      return `b:${value ? '1' : '0'};`;
    }
    if (typeof value === 'number') {
      // Handle special float values
      if (value === Infinity) {
        return 'd:INF;';
      }
      if (value === -Infinity) {
        return 'd:-INF;';
      }
      if (Number.isNaN(value)) {
        return 'd:NAN;';
      }
      if (Number.isInteger(value)) {
        return `i:${value};`;
      }
      return `d:${value};`;
    }
    if (typeof value === 'string') {
      // Handle UTF-8 byte length correctly
      const byteLength = new TextEncoder().encode(value).length;
      return `s:${byteLength}:"${value}";`;
    }
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
      // Check for circular references
      if (referenceMap.has(value)) {
        return `r:${referenceMap.get(value)};`;
      }
      
      // Store reference for this object/array
      const refId = referenceCounter.count++;
      referenceMap.set(value, refId);

      if (Array.isArray(value)) {
        // Handle sparse arrays and preserve original keys
        const elements: string[] = [];
        let count = 0;
        
        for (let i = 0; i < value.length; i++) {
          if (i in value) {
            elements.push(`${serializeValue(i)}${serializeValue(value[i])}`);
            count++;
          }
        }
        
        return `a:${count}:{${elements.join('')}}`;
      } else {
        // Handle objects - check if it's a PHP object
        const entries = Object.entries(value);
        
        // Check if this looks like a PHP object (has __class property)
        if (value.__class && typeof value.__class === 'string') {
          const className = value.__class;
          const classNameLength = new TextEncoder().encode(className).length;
          const props = entries.filter(([k]) => k !== '__class');
          const elements = props.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
          return `O:${classNameLength}:"${className}":${props.length}:{${elements}}`;
        } else {
          // Regular associative array
          const elements = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
          return `a:${entries.length}:{${elements}}`;
        }
      }
    }
    throw new Error(`Unsupported type: ${typeof value}`);
  };

  // Enhanced PHP unserialization implementation with references
  const referenceStore: any[] = [];
  
  const unserializeValue = (input: string, resetRefs: boolean = false): { value: any; rest: string } => {
    input = input.trim();
    
    if (resetRefs) {
      referenceStore.length = 0;
    }
    
    if (input.startsWith('N;')) {
      return { value: null, rest: input.slice(2) };
    }
    
    if (input.startsWith('b:')) {
      if (input.length < 4) throw new Error('Invalid boolean format');
      const value = input[2] === '1';
      return { value, rest: input.slice(4) };
    }
    
    if (input.startsWith('i:')) {
      const end = input.indexOf(';');
      if (end === -1) throw new Error('Invalid integer format');
      const numStr = input.slice(2, end);
      if (!/^-?\d+$/.test(numStr)) throw new Error('Invalid integer value');
      const value = parseInt(numStr, 10);
      return { value, rest: input.slice(end + 1) };
    }
    
    if (input.startsWith('d:')) {
      const end = input.indexOf(';');
      if (end === -1) throw new Error('Invalid double format');
      const numStr = input.slice(2, end);
      
      // Handle special float values
      if (numStr === 'INF') {
        return { value: Infinity, rest: input.slice(end + 1) };
      }
      if (numStr === '-INF') {
        return { value: -Infinity, rest: input.slice(end + 1) };
      }
      if (numStr === 'NAN') {
        return { value: NaN, rest: input.slice(end + 1) };
      }
      
      const value = parseFloat(numStr);
      if (isNaN(value)) throw new Error('Invalid double value');
      return { value, rest: input.slice(end + 1) };
    }
    
    if (input.startsWith('s:')) {
      const colonPos = input.indexOf(':', 2);
      if (colonPos === -1) throw new Error('Invalid string format');
      const lengthStr = input.slice(2, colonPos);
      if (!/^\d+$/.test(lengthStr)) throw new Error('Invalid string length');
      const length = parseInt(lengthStr, 10);
      
      if (input[colonPos + 1] !== '"') throw new Error('String must start with quote');
      const startPos = colonPos + 2;
      const endPos = startPos + length;
      
      if (input.length < endPos + 2) throw new Error('String too short');
      if (input[endPos] !== '"' || input[endPos + 1] !== ';') {
        throw new Error('String must end with quote and semicolon');
      }
      
      const value = input.slice(startPos, endPos);
      return { value, rest: input.slice(endPos + 2) };
    }
    
    // Handle references
    if (input.startsWith('r:')) {
      const end = input.indexOf(';');
      if (end === -1) throw new Error('Invalid reference format');
      const refIdStr = input.slice(2, end);
      if (!/^\d+$/.test(refIdStr)) throw new Error('Invalid reference ID');
      const refId = parseInt(refIdStr, 10) - 1; // PHP refs are 1-based
      
      if (refId >= referenceStore.length) {
        throw new Error('Invalid reference ID: reference not found');
      }
      
      return { value: referenceStore[refId], rest: input.slice(end + 1) };
    }
    
    // Handle objects
    if (input.startsWith('O:')) {
      const firstColon = input.indexOf(':', 2);
      if (firstColon === -1) throw new Error('Invalid object format');
      const classNameLengthStr = input.slice(2, firstColon);
      if (!/^\d+$/.test(classNameLengthStr)) throw new Error('Invalid class name length');
      const classNameLength = parseInt(classNameLengthStr, 10);
      
      let rest = input.slice(firstColon + 1);
      if (!rest.startsWith('"')) throw new Error('Class name must start with quote');
      const className = rest.slice(1, 1 + classNameLength);
      rest = rest.slice(1 + classNameLength);
      
      if (!rest.startsWith('":')) throw new Error('Invalid object format after class name');
      rest = rest.slice(2);
      
      const propCountEnd = rest.indexOf(':');
      if (propCountEnd === -1) throw new Error('Invalid object property count');
      const propCountStr = rest.slice(0, propCountEnd);
      if (!/^\d+$/.test(propCountStr)) throw new Error('Invalid property count');
      const propCount = parseInt(propCountStr, 10);
      
      rest = rest.slice(propCountEnd + 1);
      if (!rest.startsWith('{')) throw new Error('Object must start with {');
      rest = rest.slice(1);
      
      const result: any = { __class: className };
      referenceStore.push(result); // Store reference before parsing properties
      
      for (let i = 0; i < propCount; i++) {
        const keyResult = unserializeValue(rest);
        const valueResult = unserializeValue(keyResult.rest);
        rest = valueResult.rest;
        result[keyResult.value] = valueResult.value;
      }
      
      if (!rest.startsWith('}')) throw new Error('Object must end with }');
      rest = rest.slice(1);
      
      return { value: result, rest };
    }
    
    if (input.startsWith('a:')) {
      const colonPos = input.indexOf(':', 2);
      if (colonPos === -1) throw new Error('Invalid array format');
      const lengthStr = input.slice(2, colonPos);
      if (!/^\d+$/.test(lengthStr)) throw new Error('Invalid array length');
      const length = parseInt(lengthStr, 10);
      
      let rest = input.slice(colonPos + 1);
      if (!rest.startsWith('{')) throw new Error('Array must start with {');
      rest = rest.slice(1);
      
      const result: any = {};
      referenceStore.push(result); // Store reference before parsing elements
      let isSequentialArray = true;
      let maxIndex = -1;
      
      for (let i = 0; i < length; i++) {
        const keyResult = unserializeValue(rest);
        const valueResult = unserializeValue(keyResult.rest);
        rest = valueResult.rest;
        
        result[keyResult.value] = valueResult.value;
        
        // Check if this is a sequential array
        if (typeof keyResult.value === 'number' && keyResult.value === i) {
          maxIndex = Math.max(maxIndex, keyResult.value);
        } else {
          isSequentialArray = false;
        }
      }
      
      if (!rest.startsWith('}')) throw new Error('Array must end with }');
      rest = rest.slice(1);
      
      // Convert to array if it's sequential and starts from 0
      if (isSequentialArray && length > 0 && maxIndex === length - 1) {
        const arr = [];
        for (let i = 0; i < length; i++) {
          arr[i] = result[i];
        }
        // Update the stored reference to point to the array
        referenceStore[referenceStore.length - 1] = arr;
        return { value: arr, rest };
      }
      
      return { value: result, rest };
    }
    
    throw new Error(`Unsupported or invalid serialized format: ${input.slice(0, 10)}...`);
  };

  const handleSerialize = (input: string) => {
    try {
      setUnserialized(input);
      if (!input.trim()) {
        setSerialized('');
        setError('');
        return;
      }
      const value = parsePhpSyntax(input);
      const result = serializeValue(value, true); // Reset references
      setSerialized(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PHP array/object syntax');
    }
  };

  const handleUnserialize = (input: string) => {
    try {
      setSerialized(input);
      if (!input.trim()) {
        setUnserialized('');
        setError('');
        return;
      }
      const { value } = unserializeValue(input, true); // Reset references
      setUnserialized(generatePhpSyntax(value));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PHP serialized format');
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearAll = () => {
    setSerialized('');
    setUnserialized('');
    setError('');
  };

  const swapContent = () => {
    try {
      const tempSerialized = serialized;
      const tempUnserialized = unserialized;
      
      // Process the swapped content properly
      if (tempUnserialized.trim()) {
        // Left panel content (PHP array) goes to right panel (serialized)
        const leftPanelValue = parsePhpSyntax(tempUnserialized);
        const newSerialized = serializeValue(leftPanelValue, true);
        setSerialized(newSerialized);
      } else {
        setSerialized('');
      }
      
      if (tempSerialized.trim()) {
        // Right panel content (serialized) goes to left panel (PHP array)
        const { value } = unserializeValue(tempSerialized, true);
        const newUnserialized = generatePhpSyntax(value);
        setUnserialized(newUnserialized);
      } else {
        setUnserialized('');
      }
      
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error swapping content - check format validity');
    }
  };

  const formatPhp = () => {
    try {
      if (unserialized.trim()) {
        const parsed = parsePhpSyntax(unserialized);
        setUnserialized(generatePhpSyntax(parsed));
        setError('');
      }
    } catch (err) {
      setError('Invalid PHP array/object syntax');
    }
  };

  const minifyPhp = () => {
    try {
      if (unserialized.trim()) {
        const parsed = parsePhpSyntax(unserialized);
        // Generate minified version by removing extra whitespace
        const formatted = generatePhpSyntax(parsed);
        const minified = formatted.replace(/\s+/g, ' ').replace(/\s*=>\s*/g, '=>').replace(/\s*,\s*/g, ',');
        setUnserialized(minified);
        setError('');
      }
    } catch (err) {
      setError('Invalid PHP array/object syntax');
    }
  };

  const loadSample = () => {
    const phpSampleData = `[
  'user' => new User([
    'id' => 123,
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'active' => true,
    'balance' => 99.99,
    'preferences' => null,
    'tags' => ['developer', 'admin'],
    'metadata' => [
      'created_at' => '2024-01-15',
      'last_login' => '2024-07-16',
      'login_count' => 42
    ]
  ]),
  'settings' => [
    'theme' => 'dark',
    'notifications' => true,
    'language' => 'en-US'
  ],
  'items' => [
    'item1',
    'item2',
    'item3'
  ],
  'special_numbers' => [
    'infinity' => INF,
    'negative_infinity' => -INF,
    'not_a_number' => NAN
  ],
  'utf8_test' => '测试 café 🚀'
]`;
    
    handleSerialize(phpSampleData);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">PHP Serializer/Unserializer</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            title="Load sample data to test the serializer"
          >
            <FileText size={16} />
            Load Sample
          </button>
          <button
            type="button"
            onClick={swapContent}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Swap content between panels"
          >
            <ArrowLeftRight size={16} />
            Swap
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Clear all content"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              PHP Array/Object
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={formatPhp}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Format PHP syntax"
              >
                Format
              </button>
              <button
                type="button"
                onClick={minifyPhp}
                className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                title="Minify PHP syntax"
              >
                Minify
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(unserialized, 'PHP')}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                title="Copy PHP syntax"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={unserialized}
            onChange={(e) => handleSerialize(e.target.value)}
            className="w-full h-[65vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter PHP array syntax (e.g. ['foo' =&gt; 'bar', 'numbers' =&gt; [1, 2, 3], 'nested' =&gt; ['key' =&gt; 'value']])"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              PHP Serialized
            </label>
            <button
              type="button"
              onClick={() => copyToClipboard(serialized, 'PHP')}
              className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              title="Copy PHP serialized string"
            >
              <Copy size={12} />
            </button>
          </div>
          <textarea
            value={serialized}
            onChange={(e) => handleUnserialize(e.target.value)}
            className="w-full h-[65vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder='Enter PHP serialized string (e.g. a:1:{s:3:"foo";s:3:"bar";})'
          />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm text-red-800 font-medium">Error:</div>
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Features & Supported Types:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>Bidirectional conversion:</strong> PHP array/object syntax ↔ PHP serialized format</p>
          <p>• <strong>Supported types:</strong> strings, integers, floats, booleans, null, arrays, objects, PHP objects</p>
          <p>• <strong>UTF-8 support:</strong> Correctly handles multi-byte characters with proper byte length</p>
          <p>• <strong>PHP syntax support:</strong> Both ['key' =&gt; 'value'] and array('key' =&gt; 'value') formats</p>
          <p>• <strong>Special values:</strong> INF, -INF, NaN support</p>
          <p>• <strong>Reference tracking:</strong> Handles circular references and object sharing</p>
          <p>• <strong>PHP objects:</strong> Supports PHP class serialization with new ClassName() syntax</p>
          <p>• <strong>Array detection:</strong> Automatically converts sequential arrays vs associative arrays</p>
          <p>• <strong>Error handling:</strong> Detailed error messages for invalid formats</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Example Usage:</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <strong>PHP Array:</strong> <code className="bg-white px-2 py-1 rounded">['name' =&gt; 'John', 'age' =&gt; 30, 'active' =&gt; true]</code>
          </div>
          <div>
            <strong>Serialized:</strong> <code className="bg-white px-2 py-1 rounded">a:3:{"{"}s:4:"name";s:4:"John";s:3:"age";i:30;s:6:"active";b:1;{"}"}</code>
          </div>
          <div>
            <strong>PHP Object:</strong> <code className="bg-white px-2 py-1 rounded">new User(['id' =&gt; 123]) → O:4:"User":1:{"{"}s:2:"id";i:123;{"}"}</code>
          </div>
          <div>
            <strong>Alternative syntax:</strong> <code className="bg-white px-2 py-1 rounded">array('key' =&gt; 'value') or ['key' =&gt; 'value']</code>
          </div>
          <div>
            <strong>Special Values:</strong> <code className="bg-white px-2 py-1 rounded">INF, -INF, NAN → d:INF;, d:-INF;, d:NAN;</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhpSerializer; 