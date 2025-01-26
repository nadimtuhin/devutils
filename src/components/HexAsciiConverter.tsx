import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

type Mode = 'hex-to-ascii' | 'ascii-to-hex';

export default function HexAsciiConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('hex-to-ascii');

  const hexToAscii = (hex: string): string => {
    try {
      // Remove spaces and validate hex string
      const cleanHex = hex.replace(/\\s/g, '');
      if (!/^[0-9A-Fa-f]*$/.test(cleanHex)) {
        throw new Error('Invalid hex string');
      }
      if (cleanHex.length % 2 !== 0) {
        throw new Error('Hex string length must be even');
      }

      // Convert hex to ASCII
      const ascii = cleanHex.match(/.{2}/g)?.map(byte => {
        const charCode = parseInt(byte, 16);
        // Only convert printable ASCII characters
        if (charCode >= 32 && charCode <= 126) {
          return String.fromCharCode(charCode);
        }
        // Return a dot for non-printable characters
        return '.';
      }).join('') || '';

      return ascii;
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return 'Error converting hex to ASCII';
    }
  };

  const asciiToHex = (ascii: string): string => {
    try {
      // Convert ASCII to hex
      const hex = Array.from(ascii)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');

      return hex.toUpperCase();
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return 'Error converting ASCII to hex';
    }
  };

  const handleConvert = () => {
    const converted = mode === 'hex-to-ascii' ? hexToAscii(input) : asciiToHex(input);
    setOutput(converted);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Hex ↔ ASCII Converter</h2>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setMode('hex-to-ascii')}
            className={`px-4 py-2 rounded-md ${
              mode === 'hex-to-ascii'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hex to ASCII
          </button>
          <button
            onClick={() => setMode('ascii-to-hex')}
            className={`px-4 py-2 rounded-md ${
              mode === 'ascii-to-hex'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ASCII to Hex
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === 'hex-to-ascii' ? 'Hex Input' : 'ASCII Input'}
            </label>
            <CodeEditor
              value={input}
              language="text"
              placeholder={mode === 'hex-to-ascii' ? 'Enter hex string...' : 'Enter ASCII text...'}
              onChange={(e) => setInput(e.target.value)}
              padding={15}
              className="h-[500px] font-mono text-sm border border-gray-300 rounded-md"
              style={{
                backgroundColor: '#f9fafb',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {mode === 'hex-to-ascii' ? 'ASCII Output' : 'Hex Output'}
            </label>
            <CodeEditor
              value={output}
              language="text"
              readOnly
              padding={15}
              className="h-[500px] font-mono text-sm border border-gray-300 rounded-md bg-gray-50"
              style={{
                backgroundColor: '#f9fafb',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          </div>
        </div>
        <button
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Convert
        </button>
      </div>
    </div>
  );
} 