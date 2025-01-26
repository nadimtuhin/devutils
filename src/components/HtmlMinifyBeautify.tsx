import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { minify as minifyCss } from 'csso';
import { minify as minifyJs } from 'terser';
import { format } from 'prettier';
import * as parserHtml from 'prettier/parser-html';

const minifyHtml = async (html: string) => {
  // First format with prettier to ensure valid HTML
  const formatted = format(html, {
    parser: 'html',
    plugins: [parserHtml],
  });

  // Basic minification rules
  let minified = formatted
    // Remove comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove whitespace between tags
    .replace(/>\s+</g, '><')
    // Remove whitespace at the start and end of lines
    .replace(/^\s+|\s+$/gm, '')
    // Collapse multiple spaces
    .replace(/\s{2,}/g, ' ')
    // Remove newlines
    .replace(/\n/g, '');

  // Find and minify CSS in style tags
  minified = minified.replace(
    /<style[^>]*>([\s\S]*?)<\/style>/gi,
    (match, css) => {
      try {
        const minifiedCss = minifyCss(css).css;
        return `<style>${minifiedCss}</style>`;
      } catch {
        return match;
      }
    }
  );

  // Find and minify JavaScript in script tags
  minified = await minified.replace(
    /<script[^>]*>([\s\S]*?)<\/script>/gi,
    async (match, js) => {
      try {
        const result = await minifyJs(js);
        return `<script>${result?.code || js}</script>`;
      } catch {
        return match;
      }
    }
  );

  return minified;
};

export default function HtmlMinifyBeautify() {
  const [html, setHtml] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'minify' | 'beautify'>('beautify');
  const [error, setError] = useState('');

  const handleConvert = async () => {
    try {
      if (mode === 'minify') {
        const minified = await minifyHtml(html);
        setOutput(minified);
      } else {
        const beautified = format(html, {
          parser: 'html',
          plugins: [parserHtml],
          printWidth: 80,
          tabWidth: 2,
          useTabs: false,
        });
        setOutput(beautified);
      }
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process HTML');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">HTML Minify/Beautify</h2>
      
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
          <label className="block text-sm font-medium text-gray-700">HTML Input</label>
          <CodeEditor
            value={html}
            language="html"
            placeholder="Enter HTML code here..."
            onChange={(e) => setHtml(e.target.value)}
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
            language="html"
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