import React, { useState } from 'react';

export default function RegexpTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('');
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');

  const testRegex = () => {
    try {
      if (!pattern) {
        setMatches([]);
        setError('');
        return;
      }

      const regex = new RegExp(pattern, flags);
      const allMatches = [...testString.matchAll(regex)].map(match => match[0]);
      setMatches(allMatches);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regular expression');
      setMatches([]);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">RegExp Tester</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="/pattern/"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Flags</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="g, i, m, s, u, y"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter text to test against the regular expression..."
          />
        </div>

        <button
          onClick={testRegex}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Test
        </button>

        {error && <p className="text-red-500">{error}</p>}

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Matches ({matches.length})</h3>
          {matches.length > 0 ? (
            <ul className="space-y-2">
              {matches.map((match, index) => (
                <li
                  key={index}
                  className="px-4 py-2 bg-gray-50 rounded-md font-mono text-sm"
                >
                  {match}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No matches found</p>
          )}
        </div>
      </div>
    </div>
  );
}