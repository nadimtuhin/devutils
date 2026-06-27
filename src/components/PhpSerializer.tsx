import React, { useState } from 'react';
import { Copy, RotateCcw, ArrowLeftRight, FileText } from 'lucide-react';

const PhpSerializer = () => {
  const [serialized, setSerialized] = useState('');
  const [unserialized, setUnserialized] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'serialize' | 'unserialize'>('serialize');

  // PHP serialization format implementation
  const serializeValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N;';
    }
    if (typeof value === 'boolean') {
      return `b:${value ? '1' : '0'};`;
    }
    if (typeof value === 'number') {
      if (!isFinite(value)) {
        if (isNaN(value)) return 'd:NAN;';
        return value > 0 ? 'd:INF;' : 'd:-INF;';
      }
      if (Number.isInteger(value)) {
        return `i:${value};`;
      }
      return `d:${value};`;
    }
    if (typeof value === 'string') {
      const byteLength = new TextEncoder().encode(value).length;
      return `s:${byteLength}:"${value}";`;
    }
    if (Array.isArray(value)) {
      const elements = value.map((v, i) => `${serializeValue(i)}${serializeValue(v)}`).join('');
      return `a:${value.length}:{${elements}}`;
    }
    if (typeof value === 'object') {
      // Support __class property to emit O: (PHP object) format
      const { __class, ...props } = value as any;
      if (__class && typeof __class === 'string') {
        const entries = Object.entries(props);
        const elements = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
        const byteLen = new TextEncoder().encode(__class).length;
        return `O:${byteLen}:"${__class}":${entries.length}:{${elements}}`;
      }
      const entries = Object.entries(value);
      const elements = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
      return `a:${entries.length}:{${elements}}`;
    }
    throw new Error(`Unsupported type: ${typeof value}`);
  };

  // PHP unserialization implementation
  const unserializeValue = (input: string): { value: any; rest: string } => {
    // Do NOT trim — byte positions in s: strings are significant

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
      return { value: parseInt(numStr, 10), rest: input.slice(end + 1) };
    }

    if (input.startsWith('d:')) {
      const end = input.indexOf(';');
      if (end === -1) throw new Error('Invalid double format');
      const numStr = input.slice(2, end);
      // Handle PHP special float values: INF, -INF, NAN
      if (numStr === 'INF') return { value: Infinity, rest: input.slice(end + 1) };
      if (numStr === '-INF') return { value: -Infinity, rest: input.slice(end + 1) };
      if (numStr === 'NAN') return { value: NaN, rest: input.slice(end + 1) };
      const value = parseFloat(numStr);
      if (isNaN(value)) throw new Error(`Invalid double value: ${numStr}`);
      return { value, rest: input.slice(end + 1) };
    }

    if (input.startsWith('s:')) {
      const colonPos = input.indexOf(':', 2);
      if (colonPos === -1) throw new Error('Invalid string format');
      const lengthStr = input.slice(2, colonPos);
      if (!/^\d+$/.test(lengthStr)) throw new Error('Invalid string length');
      const byteLength = parseInt(lengthStr, 10);

      if (input[colonPos + 1] !== '"') throw new Error('String must start with quote');
      const startPos = colonPos + 2;

      // Decode exactly byteLength UTF-8 bytes from the JS string
      const bytes = new Uint8Array(byteLength);
      let byteIdx = 0;
      let charIdx = startPos;
      while (byteIdx < byteLength && charIdx < input.length) {
        const code = input.codePointAt(charIdx)!;
        if (code < 0x80) {
          bytes[byteIdx++] = code;
          charIdx++;
        } else if (code < 0x800) {
          bytes[byteIdx++] = 0xc0 | (code >> 6);
          bytes[byteIdx++] = 0x80 | (code & 0x3f);
          charIdx++;
        } else if (code < 0x10000) {
          bytes[byteIdx++] = 0xe0 | (code >> 12);
          bytes[byteIdx++] = 0x80 | ((code >> 6) & 0x3f);
          bytes[byteIdx++] = 0x80 | (code & 0x3f);
          charIdx++;
        } else {
          bytes[byteIdx++] = 0xf0 | (code >> 18);
          bytes[byteIdx++] = 0x80 | ((code >> 12) & 0x3f);
          bytes[byteIdx++] = 0x80 | ((code >> 6) & 0x3f);
          bytes[byteIdx++] = 0x80 | (code & 0x3f);
          charIdx += 2; // surrogate pair = 2 JS chars
        }
      }
      const value = new TextDecoder().decode(bytes);

      const endPos = charIdx;
      if (input[endPos] !== '"' || input[endPos + 1] !== ';') {
        throw new Error('String must end with quote and semicolon');
      }
      return { value, rest: input.slice(endPos + 2) };
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

      const result: Record<string | number, any> = {};
      let isSequentialArray = true;

      for (let i = 0; i < length; i++) {
        const keyResult = unserializeValue(rest);
        const valueResult = unserializeValue(keyResult.rest);
        rest = valueResult.rest;
        result[keyResult.value] = valueResult.value;
        // Sequential: integer keys 0, 1, 2, ... in order
        if (keyResult.value !== i) {
          isSequentialArray = false;
        }
      }

      if (!rest.startsWith('}')) throw new Error('Array must end with }');
      rest = rest.slice(1);

      // Empty PHP array OR sequential integer-keyed array → JS array
      if (length === 0 || isSequentialArray) {
        return { value: Array.from({ length }, (_, i) => result[i]), rest };
      }

      return { value: result, rest };
    }

    // PHP object: O:<classname_byte_len>:"<classname>":<prop_count>:{...}
    if (input.startsWith('O:')) {
      const firstColon = input.indexOf(':', 2);
      if (firstColon === -1) throw new Error('Invalid object format');
      // Find the quoted class name (skip byte-length number)
      const quoteStart = input.indexOf('"', firstColon);
      if (quoteStart === -1) throw new Error('Invalid object class name');
      const quoteEnd = input.indexOf('"', quoteStart + 1);
      if (quoteEnd === -1) throw new Error('Invalid object class name end');
      const className = input.slice(quoteStart + 1, quoteEnd);

      // After closing quote: :<prop_count>:{
      const afterClass = input.slice(quoteEnd + 1);
      const propColonEnd = afterClass.indexOf(':', 1);
      if (propColonEnd === -1) throw new Error('Invalid object prop count');
      const propCountStr = afterClass.slice(1, propColonEnd);
      if (!/^\d+$/.test(propCountStr)) throw new Error('Invalid object prop count value');
      const propCount = parseInt(propCountStr, 10);

      let rest = afterClass.slice(propColonEnd + 1);
      if (!rest.startsWith('{')) throw new Error('Object must start with {');
      rest = rest.slice(1);

      // Represent as plain object with __class marker
      const result: Record<string, any> = { __class: className };
      for (let i = 0; i < propCount; i++) {
        const keyResult = unserializeValue(rest);
        const valueResult = unserializeValue(keyResult.rest);
        rest = valueResult.rest;
        result[String(keyResult.value)] = valueResult.value;
      }

      if (!rest.startsWith('}')) throw new Error('Object must end with }');
      rest = rest.slice(1);

      return { value: result, rest };
    }

    throw new Error(`Unsupported or invalid serialized format: ${JSON.stringify(input.slice(0, 20))}`);
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
      const result = serializeValue(value);
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
      const { value } = unserializeValue(input);
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
      ]
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
          <p>• <strong>Supported types:</strong> strings, integers, floats, booleans, null, arrays, objects</p>
          <p>• <strong>UTF-8 support:</strong> Correctly handles multi-byte characters</p>
          <p>• <strong>Array detection:</strong> Automatically converts sequential arrays vs associative arrays</p>
          <p>• <strong>Error handling:</strong> Detailed error messages for invalid formats</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">Example Usage:</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <div>
            <strong>JSON:</strong> <code className="bg-white px-2 py-1 rounded">{"{"}"name": "John", "age": 30, "active": true{"}"}</code>
          </div>
          <div>
            <strong>PHP:</strong> <code className="bg-white px-2 py-1 rounded">a:3:{"{"}s:4:"name";s:4:"John";s:3:"age";i:30;s:6:"active";b:1;{"}"}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhpSerializer; 