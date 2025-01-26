import React, { useState } from 'react';
import { format } from 'sql-formatter';

const SqlFormatter = () => {
  const [sql, setSql] = useState('');
  const [formattedSql, setFormattedSql] = useState('');
  const [error, setError] = useState('');

  const formatSql = (input: string) => {
    try {
      setSql(input);
      const formatted = format(input, {
        language: 'sql',
        uppercase: true,
        linesBetweenQueries: 2,
      });
      setFormattedSql(formatted);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format SQL');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">SQL Formatter</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <textarea
            value={sql}
            onChange={(e) => formatSql(e.target.value)}
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter SQL query here..."
          />
        </div>
        <div>
          <textarea
            value={formattedSql}
            readOnly
            className="w-full h-[70vh] p-4 font-mono text-sm border rounded-lg bg-gray-50"
            placeholder="Formatted SQL will appear here..."
          />
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SqlFormatter; 