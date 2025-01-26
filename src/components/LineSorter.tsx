import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

type SortOrder = 'asc' | 'desc';
type SortType = 'alphabetical' | 'length' | 'numeric';

export default function LineSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [sortType, setSortType] = useState<SortType>('alphabetical');
  const [deduplicate, setDeduplicate] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [trimLines, setTrimLines] = useState(true);

  const handleSort = () => {
    try {
      // Split input into lines and optionally trim
      let lines = input.split('\\n');
      if (trimLines) {
        lines = lines.map(line => line.trim());
      }

      // Filter out empty lines
      lines = lines.filter(line => line.length > 0);

      // Deduplicate if needed
      if (deduplicate) {
        if (!caseSensitive) {
          const seen = new Set<string>();
          lines = lines.filter(line => {
            const lower = line.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
          });
        } else {
          lines = Array.from(new Set(lines));
        }
      }

      // Sort lines
      lines.sort((a, b) => {
        let comparison = 0;
        
        if (!caseSensitive) {
          a = a.toLowerCase();
          b = b.toLowerCase();
        }

        let numA: number;
        let numB: number;

        switch (sortType) {
          case 'alphabetical':
            comparison = a.localeCompare(b);
            break;
          case 'length':
            comparison = a.length - b.length;
            break;
          case 'numeric':
            numA = parseFloat(a);
            numB = parseFloat(b);
            if (isNaN(numA) && isNaN(numB)) comparison = 0;
            else if (isNaN(numA)) comparison = 1;
            else if (isNaN(numB)) comparison = -1;
            else comparison = numA - numB;
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });

      setOutput(lines.join('\\n'));
    } catch (error) {
      if (error instanceof Error) {
        setOutput(`Error: ${error.message}`);
      } else {
        setOutput('Error processing lines');
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Line Sorter</h2>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value as SortType)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="length">Length</option>
            <option value="numeric">Numeric</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={deduplicate}
              onChange={(e) => setDeduplicate(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Remove duplicates</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Case sensitive</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Trim lines</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Input Text</label>
            <CodeEditor
              value={input}
              language="text"
              placeholder="Enter text to sort..."
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
            <label className="block text-sm font-medium text-gray-700">Sorted Output</label>
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
          onClick={handleSort}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Sort
        </button>
      </div>
    </div>
  );
} 
