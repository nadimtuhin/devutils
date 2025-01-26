import React, { useState } from 'react';
import { diffLines, Change } from 'diff';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<Change[]>([]);

  const generateDiff = () => {
    const differences = diffLines(text1, text2);
    setDiff(differences);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Text Diff Checker</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Original Text</label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Enter original text..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Modified Text</label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Enter modified text..."
            />
          </div>
        </div>
        <button
          onClick={generateDiff}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Compare
        </button>
        {diff.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Differences</h3>
            <pre className="w-full p-4 bg-gray-50 rounded-md overflow-auto font-mono text-sm whitespace-pre-wrap">
              {diff.map((part, index) => (
                <span
                  key={index}
                  className={`block ${
                    part.added
                      ? 'bg-green-100 text-green-800'
                      : part.removed
                      ? 'bg-red-100 text-red-800'
                      : ''
                  }`}
                >
                  {part.added ? '+ ' : part.removed ? '- ' : '  '}
                  {part.value}
                </span>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}