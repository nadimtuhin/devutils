import React, { useState, useRef } from 'react';
import { diffLines, diffWords, Change } from 'diff';
import { Copy, Upload, RotateCw, Settings, Eye, EyeOff } from 'lucide-react';

export default function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<Change[]>([]);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');
  const [diffMode, setDiffMode] = useState<'lines' | 'words'>('lines');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, changes: 0 });
  const fileInput1 = useRef<HTMLInputElement>(null);
  const fileInput2 = useRef<HTMLInputElement>(null);

  const generateDiff = () => {
    let text1ToCompare = text1;
    let text2ToCompare = text2;

    if (ignoreWhitespace) {
      text1ToCompare = text1.replace(/\s+/g, ' ').trim();
      text2ToCompare = text2.replace(/\s+/g, ' ').trim();
    }

    const differences = diffMode === 'lines' 
      ? diffLines(text1ToCompare, text2ToCompare)
      : diffWords(text1ToCompare, text2ToCompare);
    
    setDiff(differences);

    // Calculate stats
    const additions = differences.filter(d => d.added).length;
    const deletions = differences.filter(d => d.removed).length;
    const changes = differences.filter(d => d.added || d.removed).length;
    setStats({ additions, deletions, changes });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFileUpload = (file: File, setText: (text: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setText1('');
    setText2('');
    setDiff([]);
    setStats({ additions: 0, deletions: 0, changes: 0 });
  };

  const renderUnifiedDiff = () => {
    let lineNumber = 1;
    
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Unified Diff</span>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-600">+{stats.additions} additions</span>
            <span className="text-red-600">-{stats.deletions} deletions</span>
          </div>
        </div>
        <div className="font-mono text-sm">
          {diff.map((part, index) => {
            const lines = part.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '');
            
            return lines.map((line, lineIndex) => {
              const currentLineNumber = lineNumber++;
              const isLastLine = lineIndex === lines.length - 1 && part.value.endsWith('\n');
              
              return (
                <div
                  key={`${index}-${lineIndex}`}
                  className={`flex ${
                    part.added
                      ? 'bg-green-50 border-l-4 border-green-400'
                      : part.removed
                      ? 'bg-red-50 border-l-4 border-red-400'
                      : 'bg-white'
                  }`}
                >
                  {showLineNumbers && (
                    <div className="w-16 px-2 py-1 text-gray-500 text-right bg-gray-50 border-r border-gray-200 select-none">
                      {!part.added && !part.removed ? currentLineNumber : ''}
                    </div>
                  )}
                  <div className="flex-1 px-4 py-1">
                    <span className={`inline-block w-4 ${
                      part.added ? 'text-green-600' : part.removed ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {part.added ? '+' : part.removed ? '-' : ' '}
                    </span>
                    <span className="ml-2">{line}</span>
                  </div>
                </div>
              );
            });
          })}
        </div>
      </div>
    );
  };

  const renderSplitDiff = () => {
    const leftLines: string[] = [];
    const rightLines: string[] = [];
    const leftTypes: ('added' | 'removed' | 'normal')[] = [];
    const rightTypes: ('added' | 'removed' | 'normal')[] = [];

    diff.forEach(part => {
      const lines = part.value.split('\n').filter((line, i, arr) => i < arr.length - 1 || line !== '');
      
      if (part.removed) {
        lines.forEach(line => {
          leftLines.push(line);
          rightLines.push('');
          leftTypes.push('removed');
          rightTypes.push('normal');
        });
      } else if (part.added) {
        lines.forEach(line => {
          leftLines.push('');
          rightLines.push(line);
          leftTypes.push('normal');
          rightTypes.push('added');
        });
      } else {
        lines.forEach(line => {
          leftLines.push(line);
          rightLines.push(line);
          leftTypes.push('normal');
          rightTypes.push('normal');
        });
      }
    });

    const maxLines = Math.max(leftLines.length, rightLines.length);

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <span className="text-sm font-medium text-gray-700">Original</span>
            <span className="text-sm font-medium text-gray-700">Modified</span>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-green-600">+{stats.additions}</span>
            <span className="text-red-600">-{stats.deletions}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 font-mono text-sm">
          <div className="border-r border-gray-200">
            {leftLines.map((line, index) => (
              <div
                key={`left-${index}`}
                className={`flex ${
                  leftTypes[index] === 'removed' ? 'bg-red-50' : 'bg-white'
                }`}
              >
                {showLineNumbers && (
                  <div className="w-12 px-2 py-1 text-gray-500 text-right bg-gray-50 border-r border-gray-200 select-none">
                    {line ? index + 1 : ''}
                  </div>
                )}
                <div className="flex-1 px-4 py-1">
                  <span className={`inline-block w-4 ${
                    leftTypes[index] === 'removed' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {leftTypes[index] === 'removed' ? '-' : ' '}
                  </span>
                  <span className="ml-2">{line}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            {rightLines.map((line, index) => (
              <div
                key={`right-${index}`}
                className={`flex ${
                  rightTypes[index] === 'added' ? 'bg-green-50' : 'bg-white'
                }`}
              >
                {showLineNumbers && (
                  <div className="w-12 px-2 py-1 text-gray-500 text-right bg-gray-50 border-r border-gray-200 select-none">
                    {line ? index + 1 : ''}
                  </div>
                )}
                <div className="flex-1 px-4 py-1">
                  <span className={`inline-block w-4 ${
                    rightTypes[index] === 'added' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {rightTypes[index] === 'added' ? '+' : ' '}
                  </span>
                  <span className="ml-2">{line}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Text Diff Checker</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearAll}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            title="Clear all"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Original Text</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInput1.current?.click()}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title="Upload file"
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={() => copyToClipboard(text1)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title="Copy text"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
              placeholder="Enter original text or upload a file..."
            />
            <input
              ref={fileInput1}
              type="file"
              accept=".txt,.md,.json,.xml,.csv,.log"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, setText1);
              }}
              className="hidden"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Modified Text</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInput2.current?.click()}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title="Upload file"
                >
                  <Upload size={16} />
                </button>
                <button
                  onClick={() => copyToClipboard(text2)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title="Copy text"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
              placeholder="Enter modified text or upload a file..."
            />
            <input
              ref={fileInput2}
              type="file"
              accept=".txt,.md,.json,.xml,.csv,.log"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, setText2);
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Options and Compare Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'unified' | 'split')}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="unified">Unified</option>
                <option value="split">Split</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Diff:</label>
              <select
                value={diffMode}
                onChange={(e) => setDiffMode(e.target.value as 'lines' | 'words')}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="lines">Lines</option>
                <option value="words">Words</option>
              </select>
            </div>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Ignore whitespace</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Line numbers</span>
            </label>
          </div>

          <button
            onClick={generateDiff}
            disabled={!text1.trim() || !text2.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Compare
          </button>
        </div>

        {/* Results */}
        {diff.length > 0 && (
          <div className="space-y-4">
            {viewMode === 'unified' ? renderUnifiedDiff() : renderSplitDiff()}
          </div>
        )}
      </div>
    </div>
  );
}