import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function SvgToCss() {
  const [svg, setSvg] = useState('');
  const [css, setCss] = useState('');

  const handleConvert = () => {
    try {
      // Remove newlines and escape quotes
      const cleanedSvg = svg
        .replace(/\n/g, '')
        .replace(/"/g, "'")
        .replace(/\s+/g, ' ')
        .trim();

      // URL encode the SVG
      const encodedSvg = encodeURIComponent(cleanedSvg);

      // Create the CSS
      const cssOutput = `.element {\n  background-image: url("data:image/svg+xml,${encodedSvg}");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: contain;\n}`;

      setCss(cssOutput);
    } catch (error) {
      setCss('Error converting SVG to CSS');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">SVG to CSS Converter</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">SVG Input</label>
          <CodeEditor
            value={svg}
            language="xml"
            placeholder="Enter SVG code here..."
            onChange={(e) => setSvg(e.target.value)}
            padding={15}
            className="h-[500px] font-mono text-sm border border-gray-300 rounded-md"
            style={{
              backgroundColor: '#f9fafb',
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">CSS Output</label>
          <CodeEditor
            value={css}
            language="css"
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
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Convert
      </button>
    </div>
  );
} 