import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownPreview = () => {
  const [markdown, setMarkdown] = useState('');

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Markdown Preview</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter markdown here..."
          />
        </div>
        <div className="prose max-w-none p-4 border rounded-lg bg-white overflow-auto h-[70vh]">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default MarkdownPreview; 