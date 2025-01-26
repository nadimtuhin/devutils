import React, { useState } from 'react';

const bases = [
  { value: 2, name: 'Binary' },
  { value: 8, name: 'Octal' },
  { value: 10, name: 'Decimal' },
  { value: 16, name: 'Hexadecimal' },
  { value: 32, name: 'Base32' },
  { value: 36, name: 'Base36' }
];

const isValidForBase = (value: string, base: number): boolean => {
  const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
  return new RegExp(`^[${validChars}]+$`, 'i').test(value);
};

export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState(10);
  const [error, setError] = useState('');

  const convert = (to: number): string => {
    try {
      if (!input) return '';
      if (!isValidForBase(input, fromBase)) {
        throw new Error(`Invalid characters for ${bases.find(b => b.value === fromBase)?.name}`);
      }
      const decimal = parseInt(input.toUpperCase(), fromBase);
      if (isNaN(decimal)) {
        throw new Error('Invalid number format');
      }
      return decimal.toString(to).toUpperCase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      return '';
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setError('');
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Number Base Converter</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Input Number</label>
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="Enter a number..."
            />
            <select
              value={fromBase}
              onChange={(e) => {
                setFromBase(Number(e.target.value));
                setError('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {bases.map((base) => (
                <option key={base.value} value={base.value}>
                  {base.name}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {bases.map((base) => (
            <div key={base.value} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{base.name}</label>
              <input
                type="text"
                value={base.value === fromBase ? input : convert(base.value)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}