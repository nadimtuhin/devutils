import React, { useState } from 'react';

const PhpSerializer = () => {
  const [serialized, setSerialized] = useState('');
  const [unserialized, setUnserialized] = useState('');
  const [error, setError] = useState('');

  // Basic PHP serialization format implementation
  const serializeValue = (value: any): string => {
    if (value === null) {
      return 'N;';
    }
    if (typeof value === 'boolean') {
      return `b:${value ? '1' : '0'};`;
    }
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return `i:${value};`;
      }
      return `d:${value};`;
    }
    if (typeof value === 'string') {
      return `s:${value.length}:"${value}";`;
    }
    if (Array.isArray(value)) {
      const elements = value.map((v, i) => `${serializeValue(i)}${serializeValue(v)}`).join('');
      return `a:${value.length}:{${elements}}`;
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      const elements = entries.map(([k, v]) => `${serializeValue(k)}${serializeValue(v)}`).join('');
      return `a:${entries.length}:{${elements}}`;
    }
    throw new Error('Unsupported type');
  };

  // Basic PHP unserialization implementation
  const unserializeValue = (input: string): { value: any; rest: string } => {
    if (input.startsWith('N;')) {
      return { value: null, rest: input.slice(2) };
    }
    if (input.startsWith('b:')) {
      const value = input[2] === '1';
      return { value, rest: input.slice(4) };
    }
    if (input.startsWith('i:')) {
      const end = input.indexOf(';');
      const value = parseInt(input.slice(2, end));
      return { value, rest: input.slice(end + 1) };
    }
    if (input.startsWith('d:')) {
      const end = input.indexOf(';');
      const value = parseFloat(input.slice(2, end));
      return { value, rest: input.slice(end + 1) };
    }
    if (input.startsWith('s:')) {
      const colonPos = input.indexOf(':', 2);
      const length = parseInt(input.slice(2, colonPos));
      const value = input.slice(colonPos + 2, colonPos + 2 + length);
      return { value, rest: input.slice(colonPos + 2 + length + 2) };
    }
    if (input.startsWith('a:')) {
      const colonPos = input.indexOf(':', 2);
      const length = parseInt(input.slice(2, colonPos));
      let rest = input.slice(colonPos + 2);
      if (!rest.startsWith('{')) throw new Error('Invalid array format');
      rest = rest.slice(1);
      const result: any = Array.isArray(length) ? [] : {};
      for (let i = 0; i < length; i++) {
        const key = unserializeValue(rest);
        const value = unserializeValue(key.rest);
        rest = value.rest;
        result[key.value] = value.value;
      }
      if (!rest.startsWith('}')) throw new Error('Invalid array format');
      return { value: result, rest: rest.slice(1) };
    }
    throw new Error('Unsupported type');
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PHP Serializer/Unserializer</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON/Object
          </label>
          <textarea
            value={unserialized}
            onChange={(e) => handleSerialize(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='Enter JSON (e.g. {"foo": "bar"})'
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PHP Serialized
          </label>
          <textarea
            value={serialized}
            onChange={(e) => handleUnserialize(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='Enter PHP serialized string (e.g. a:1:{s:3:"foo";s:3:"bar";}'
          />
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="text-sm text-gray-500">
        <p>Note: This handles basic PHP serialization for strings, numbers, booleans, null, arrays, and objects. Some complex PHP structures might not convert correctly.</p>
      </div>
    </div>
  );
};

export default PhpSerializer; 