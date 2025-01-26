import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

const convertToJsx = (html: string): string => {
  // Convert class to className
  let jsx = html.replace(/class=/g, 'className=');

  // Convert for to htmlFor
  jsx = jsx.replace(/for=/g, 'htmlFor=');

  // Convert style strings to objects
  jsx = jsx.replace(/style="([^"]*)"/g, (match, styles) => {
    const styleObject = styles
      .split(';')
      .filter(Boolean)
      .map(style => {
        const [property, value] = style.split(':').map(s => s.trim());
        const camelProperty = property.replace(/-([a-z])/g, g => g[1].toUpperCase());
        return `${camelProperty}: '${value}'`;
      })
      .join(', ');
    return `style={{${styleObject}}}`;
  });

  // Self-closing tags
  const selfClosingTags = ['img', 'input', 'br', 'hr', 'meta', 'link'];
  selfClosingTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*)>`, 'g');
    jsx = jsx.replace(regex, `<${tag}$1 />`);
  });

  return jsx;
};

export default function HtmlToJsx() {
  const [html, setHtml] = useState('');
  const [jsx, setJsx] = useState('');

  const handleConvert = () => {
    try {
      const converted = convertToJsx(html);
      setJsx(converted);
    } catch (error) {
      setJsx('Error converting HTML to JSX');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">HTML to JSX Converter</h2>
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
          <label className="block text-sm font-medium text-gray-700">JSX Output</label>
          <CodeEditor
            value={jsx}
            language="jsx"
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