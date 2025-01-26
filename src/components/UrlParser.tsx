import React, { useState } from 'react';

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  searchParams: Record<string, string>;
}

export default function UrlParser() {
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState('');

  const parseUrl = () => {
    try {
      const urlObj = new URL(url);
      const searchParams: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      setParsed({
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port,
        pathname: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash,
        searchParams
      });
      setError('');
    } catch (err) {
      setError('Invalid URL');
      setParsed(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">URL Parser</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter URL to parse..."
          />
        </div>
        <button
          onClick={parseUrl}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Parse
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {parsed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Protocol</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.protocol}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Hostname</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.hostname}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.port || '(default)'}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Pathname</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.pathname}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.search || '(none)'}</p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Hash</label>
                <p className="px-3 py-2 bg-gray-50 rounded-md">{parsed.hash || '(none)'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">Query Parameters</h3>
              {Object.keys(parsed.searchParams).length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(parsed.searchParams).map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No query parameters</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}