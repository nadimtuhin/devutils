import React, { useState } from 'react';

interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
}

export default function JwtDebugger() {
  const [jwt, setJwt] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState('');

  const decodeJwt = () => {
    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const decoded: DecodedJwt = {
        header: JSON.parse(atob(parts[0])),
        payload: JSON.parse(atob(parts[1])),
        signature: parts[2]
      };

      setDecoded(decoded);
      setError('');
    } catch (err) {
      setError('Invalid JWT token');
      setDecoded(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold dark:text-white mb-6">JWT Debugger</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">JWT Token</label>
          <textarea
            value={jwt}
            onChange={(e) => setJwt(e.target.value)}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Paste your JWT token here..."
          />
        </div>
        <button
          onClick={decodeJwt}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Decode
        </button>
        
        {error && <p className="text-red-500">{error}</p>}
        
        {decoded && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Header</h3>
              <pre className="w-full p-4 bg-gray-50 rounded-md overflow-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payload</h3>
              <pre className="w-full p-4 bg-gray-50 rounded-md overflow-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Signature</h3>
              <pre className="w-full p-4 bg-gray-50 rounded-md overflow-auto">
                {decoded.signature}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}