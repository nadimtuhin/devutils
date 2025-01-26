import React, { useState } from 'react';
import yaml from 'js-yaml';

export default function YamlToJson() {
  const [yamlInput, setYamlInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');

  const convertToJson = () => {
    try {
      const parsed = yaml.load(yamlInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid YAML');
      setJsonOutput('');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">YAML to JSON Converter</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">YAML Input</label>
          <textarea
            value={yamlInput}
            onChange={(e) => setYamlInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Enter YAML here..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">JSON Output</label>
          <pre
            className={`w-full h-96 px-3 py-2 border border-gray-300 rounded-md overflow-auto ${
              error ? 'text-red-600' : ''
            }`}
          >
            {error || jsonOutput}
          </pre>
        </div>
      </div>
      <button
        onClick={convertToJson}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Convert
      </button>
    </div>
  );
}