import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function HtmlPreview() {
  const [html, setHtml] = useState('');

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">HTML Preview</h2>
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
          <label className="block text-sm font-medium text-gray-700">Preview</label>
          <div className="h-[500px] border border-gray-300 rounded-md bg-white overflow-auto p-4">
            <iframe
              srcDoc={html}
              title="preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
}