import React, { useState } from 'react';

const PhpJsonConverter = () => {
  const [phpCode, setPhpCode] = useState('');
  const [jsonCode, setJsonCode] = useState('');
  const [error, setError] = useState('');

  const convertPhpToJson = (input: string) => {
    try {
      setPhpCode(input);
      if (!input.trim()) {
        setJsonCode('');
        setError('');
        return;
      }

      // Basic PHP array to JSON conversion
      let json = input
        .replace(/array\s*\(/g, '{')
        .replace(/\)/g, '}')
        .replace(/=>/g, ':')
        .replace(/\[([^\]]+)\]/g, '"$1"')
        .replace(/'([^']+)'/g, '"$1"');

      // Validate the JSON
      const parsed = JSON.parse(json);
      setJsonCode(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PHP array format');
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

      // Parse JSON to validate it first
      const parsed = JSON.parse(input);
      
      // Convert JSON to PHP array format
      let php = JSON.stringify(parsed, null, 2)
        .replace(/{/g, 'array(')
        .replace(/}/g, ')')
        .replace(/"/g, "'")
        .replace(/: /g, ' => ');

      setPhpCode(php);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">PHP ↔ JSON Converter</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PHP Array
          </label>
          <textarea
            value={phpCode}
            onChange={(e) => convertPhpToJson(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter PHP array (e.g. array('foo' => 'bar'))"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON
          </label>
          <textarea
            value={jsonCode}
            onChange={(e) => convertJsonToPhp(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='Enter JSON (e.g. {"foo": "bar"})'
          />
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
      <div className="text-sm text-gray-500">
        <p>Note: This converter handles basic PHP arrays and JSON objects. Complex PHP structures might not convert correctly.</p>
      </div>
    </div>
  );
};

export default PhpJsonConverter; 
