import React, { useState } from 'react';
import cronstrue from 'cronstrue';

const CronJobParser = () => {
  const [cronExpression, setCronExpression] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const parseCron = (expression: string) => {
    try {
      setCronExpression(expression);
      if (!expression) {
        setExplanation('');
        setError('');
        return;
      }
      const explained = cronstrue.toString(expression);
      setExplanation(explained);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid cron expression');
      setExplanation('');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cron Job Parser</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cron Expression
          </label>
          <input
            type="text"
            value={cronExpression}
            onChange={(e) => parseCron(e.target.value)}
            className="w-full p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter cron expression (e.g. 0 0 * * *)"
          />
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </div>
        
        {explanation && (
          <div className="p-4 border rounded-lg bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">Explanation</h2>
            <p className="text-gray-700">{explanation}</p>
          </div>
        )}

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Quick Reference</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium mb-1">Format</h3>
              <code className="text-sm bg-gray-100 p-1 rounded">* * * * *</code>
              <p className="mt-1 text-gray-600">minute hour day month weekday</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Special Characters</h3>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-gray-100 p-1 rounded">*</code> - any value</li>
                <li><code className="bg-gray-100 p-1 rounded">,</code> - value list</li>
                <li><code className="bg-gray-100 p-1 rounded">-</code> - range</li>
                <li><code className="bg-gray-100 p-1 rounded">/</code> - step values</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Common Examples</h2>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-gray-100 p-1 rounded">0 0 * * *</code>
              <span className="ml-2 text-gray-600">Every day at midnight</span>
            </div>
            <div>
              <code className="bg-gray-100 p-1 rounded">*/15 * * * *</code>
              <span className="ml-2 text-gray-600">Every 15 minutes</span>
            </div>
            <div>
              <code className="bg-gray-100 p-1 rounded">0 9-17 * * 1-5</code>
              <span className="ml-2 text-gray-600">Every hour from 9 AM to 5 PM, Monday to Friday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CronJobParser; 