import React, { useState } from 'react';
import Papa from 'papaparse';

export default function JsonToCsv() {
  const [jsonInput, setJsonInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');

  const convertToCsv = () => {
    try {
      const jsonData = JSON.parse(jsonInput);
      if (!Array.isArray(jsonData)) {
        throw new Error('Input must be an array of objects');
      }
      
      const csv = Papa.unparse(jsonData, {
        quotes: true,
        header: true
      });
      
      setCsvOutput(csv);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setCsvOutput('');
    }
  };

  const downloadCsv = () => {
    if (!csvOutput) return;
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted.csv';
    link.click();
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">JSON to CSV Converter</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">JSON Input</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Enter JSON array of objects..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">CSV Output</label>
          <textarea
            value={error || csvOutput}
            readOnly
            className={`w-full h-96 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono ${
              error ? 'text-red-600' : ''
            }`}
          />
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <button
          onClick={convertToCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Convert
        </button>
        {csvOutput && (
          <button
            onClick={downloadCsv}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download CSV
          </button>
        )}
      </div>
    </div>
  );
}