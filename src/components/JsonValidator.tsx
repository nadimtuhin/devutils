import React, { useState } from 'react';

export default function JsonValidator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setOutput('');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">JSON Validator & Formatter</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Input JSON</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Paste your JSON here..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Formatted Output</label>
          <pre className={`w-full h-96 px-3 py-2 border border-gray-300 rounded-md overflow-auto ${error ? 'text-red-600' : ''}`}>
            {error || output}
          </pre>
        </div>
      </div>
      <button
        onClick={formatJson}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Format & Validate
      </button>
    </div>
  );
}