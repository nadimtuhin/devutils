import React, { useState } from 'react';
import he from 'he';

export default function HtmlEntityConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(he.encode(input, { useNamedReferences: true }));
      } else {
        setOutput(he.decode(input));
      }
    } catch (error) {
      setOutput('Invalid input for conversion');
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">HTML Entity Converter</h2>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-md ${
              mode === 'encode'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-md ${
              mode === 'decode'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Decode
          </button>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder={mode === 'encode' ? 'Enter HTML to encode...' : 'Enter HTML entities to decode...'}
          />
        </div>
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Convert
        </button>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Output</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono"
          />
        </div>
      </div>
    </div>
  );
}