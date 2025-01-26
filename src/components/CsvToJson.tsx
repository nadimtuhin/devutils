import React, { useState } from 'react';
import Papa from 'papaparse';

export default function CsvToJson() {
  const [csvInput, setCsvInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [error, setError] = useState('');

  const convertToJson = () => {
    try {
      Papa.parse(csvInput, {
        header: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            setError(results.errors[0].message);
            setJsonOutput('');
            return;
          }
          setJsonOutput(JSON.stringify(results.data, null, 2));
          setError('');
        },
        error: (err) => {
          setError(err.message);
          setJsonOutput('');
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid CSV');
      setJsonOutput('');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">CSV to JSON Converter</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">CSV Input</label>
          <textarea
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Enter CSV data..."
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