import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { minify } from 'terser';
import { format } from 'prettier';
import * as parserBabel from 'prettier/parser-babel';

export default function JavaScriptMinifyBeautify() {
  const [js, setJs] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'minify' | 'beautify'>('beautify');
  const [error, setError] = useState('');

  const handleConvert = async () => {
    try {
      if (mode === 'minify') {
        const result = await minify(js, {
          compress: true,
          mangle: true,
        });
        if (result.code) {
          setOutput(result.code);
        }
      } else {
        const beautified = format(js, {
          parser: 'babel',
          plugins: [parserBabel],
          semi: true,
          singleQuote: true,
        });
        setOutput(beautified);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process JavaScript');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">JavaScript Minify/Beautify</h2>
      
      <div className="mb-4 space-x-4">
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="beautify"
            checked={mode === 'beautify'}
            onChange={(e) => setMode(e.target.value as 'beautify')}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">Beautify</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="minify"
            checked={mode === 'minify'}
            onChange={(e) => setMode(e.target.value as 'minify')}
            className="form-radio text-blue-600"
          />
          <span className="ml-2">Minify</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">JavaScript Input</label>
          <CodeEditor
            value={js}
            language="js"
            placeholder="Enter JavaScript code here..."
            onChange={(e) => setJs(e.target.value)}
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
            {mode === 'minify' ? 'Minified Output' : 'Beautified Output'}
          </label>
          <CodeEditor
            value={error || output}
            language="js"
            readOnly
            padding={15}
            className={`h-[500px] font-mono text-sm border border-gray-300 rounded-md bg-gray-50 ${
              error ? 'text-red-600' : ''
            }`}
            style={{
              backgroundColor: '#f9fafb',
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {mode === 'minify' ? 'Minify' : 'Beautify'}
      </button>
    </div>
  );
} 