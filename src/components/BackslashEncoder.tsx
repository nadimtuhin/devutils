import React, { useState } from 'react';

export default function BackslashEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encode = (str: string): string => {
    return str.replace(/[\\\n\r\t'"]/g, (match) => {
      const escapes: { [key: string]: string } = {
        '\\': '\\\\',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        "'": "\\'",
        '"': '\\"'
      };
      return escapes[match];
    });
  };

  const decode = (str: string): string => {
    return str.replace(/\\([\\\n\r\t'"])/g, (_, char) => {
      const unescapes: { [key: string]: string } = {
        '\\': '\\',
        'n': '\n',
        'r': '\r',
        't': '\t',
        "'": "'",
        '"': '"'
      };
      return unescapes[char] || char;
    });
  };

  const handleConvert = () => {
    try {
      setOutput(mode === 'encode' ? encode(input) : decode(input));
    } catch (error) {
      setOutput('Invalid input for conversion');
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Backslash Encoder</h2>
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
            placeholder={mode === 'encode' ? 'Enter text to escape...' : 'Enter escaped text to unescape...'}
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