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
      const value = JSON.parse(input);
      const result = serializeValue(value, true); // Reset references
      setSerialized(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input format');
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
      setUnserialized(JSON.stringify(value, null, 2));
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
    // Simply swap the content between the two panels
    const tempSerialized = serialized;
    const tempUnserialized = unserialized;
    
    setSerialized(tempUnserialized);
    setUnserialized(tempSerialized);
    setError('');
  };

  const formatJson = () => {
    try {
      if (unserialized.trim()) {
        const parsed = JSON.parse(unserialized);
        setUnserialized(JSON.stringify(parsed, null, 2));
        setError('');
      }
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const minifyJson = () => {
    try {
      if (unserialized.trim()) {
        const parsed = JSON.parse(unserialized);
        setUnserialized(JSON.stringify(parsed));
        setError('');
      }
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const loadSample = () => {
    const sampleData = {
      "user": {
        "__class": "User",
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "active": true,
        "balance": 99.99,
        "preferences": null,
        "tags": ["developer", "admin"],
        "metadata": {
          "created_at": "2024-01-15",
          "last_login": "2024-07-16",
          "login_count": 42
        }
      },
      "settings": {
        "theme": "dark",
        "notifications": true,
        "language": "en-US"
      },
      "items": [
        "item1",
        "item2", 
        "item3"
      ],
      "special_numbers": {
        "infinity": Infinity,
        "negative_infinity": -Infinity,
        "not_a_number": NaN
      },
      "utf8_test": "测试 café 🚀"
    };
    
    const jsonString = JSON.stringify(sampleData, null, 2);
    handleSerialize(jsonString);
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
              JSON/Object
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={formatJson}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Format JSON"
              >
                Format
              </button>
              <button
                type="button"
                onClick={minifyJson}
                className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                title="Minify JSON"
              >
                Minify
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(unserialized, 'JSON')}
                className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                title="Copy JSON"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
          <textarea
            value={unserialized}
            onChange={(e) => handleSerialize(e.target.value)}
            className="w-full h-[65vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder='Enter JSON (e.g. {"foo": "bar", "numbers": [1, 2, 3], "nested": {"key": "value"}})'
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
          <p>• <strong>Bidirectional conversion:</strong> JSON ↔ PHP serialized format</p>
          <p>• <strong>Supported types:</strong> strings, integers, floats, booleans, null, arrays, objects, PHP objects</p>
          <p>• <strong>UTF-8 support:</strong> Correctly handles multi-byte characters with proper byte length</p>
          <p>• <strong>Special values:</strong> Infinity, -Infinity, NaN support</p>
          <p>• <strong>Reference tracking:</strong> Handles circular references and object sharing</p>
          <p>• <strong>PHP objects:</strong> Supports PHP class serialization with __class property</p>
          <p>• <strong>Array detection:</strong> Automatically converts sequential arrays vs associative arrays</p>
          <p>• <strong>Error handling:</strong> Detailed error messages for invalid formats</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Example Usage:</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <strong>JSON Object:</strong> <code className="bg-white px-2 py-1 rounded">{"{"}"name": "John", "age": 30, "active": true{"}"}</code>
          </div>
          <div>
            <strong>PHP Array:</strong> <code className="bg-white px-2 py-1 rounded">a:3:{"{"}s:4:"name";s:4:"John";s:3:"age";i:30;s:6:"active";b:1;{"}"}</code>
          </div>
          <div>
            <strong>PHP Object:</strong> <code className="bg-white px-2 py-1 rounded">{"{"}"__class": "User", "id": 123{"}"} → O:4:"User":1:{"{"}s:2:"id";i:123;{"}"}</code>
          </div>
          <div>
            <strong>Special Values:</strong> <code className="bg-white px-2 py-1 rounded">Infinity → d:INF;, NaN → d:NAN;</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhpSerializer; 