import React, { useState } from 'react';
import md5 from 'blueimp-md5';

async function generateHash(text: string, algorithm: string): Promise<string> {
  if (algorithm === 'MD5') {
    // blueimp-md5 returns a hex string
    return md5(text);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ [key: string]: string }>({});

  const algorithms = [
    { name: 'MD5', value: 'MD5' },
    { name: 'SHA-1', value: 'SHA-1' },
    { name: 'SHA-256', value: 'SHA-256' },
    { name: 'SHA-384', value: 'SHA-384' },
    { name: 'SHA-512', value: 'SHA-512' }
  ];

  const generateHashes = async () => {
    const newHashes: { [key: string]: string } = {};
    for (const algo of algorithms) {
      try {
        newHashes[algo.value] = await generateHash(input, algo.value);
      } catch (error) {
        newHashes[algo.value] = 'Not supported';
      }
    }
    setHashes(newHashes);
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Hash Generator</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter text to hash..."
          />
        </div>
        <button
          onClick={generateHashes}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Hashes
        </button>
        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            {algorithms.map((algo) => (
              <div key={algo.value} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{algo.name}</label>
                <div className="flex">
                  <input
                    type="text"
                    value={hashes[algo.value]}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(hashes[algo.value])}
                    className="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}