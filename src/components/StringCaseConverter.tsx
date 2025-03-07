import React, { useState } from 'react';
import { camelCase, snakeCase, kebabCase, pascalCase, noCase } from 'change-case';

const StringCaseConverter = () => {
  const [input, setInput] = useState('');

  const convertCase = (text: string, converter: (str: string) => string) => {
    try {
      return text ? converter(text) : '';
    } catch {
      return 'Error converting case';
    }
  };

  const toUpperCase = (str: string) => str.toUpperCase();
  const toLowerCase = (str: string) => str.toLowerCase();
  const toTitleCase = (str: string) => {
    return noCase(str)
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">String Case Converter</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[30vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text here..."
          />
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">camelCase</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, camelCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">PascalCase</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, pascalCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">snake_case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, snakeCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">kebab-case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, kebabCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">Title Case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toTitleCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">UPPER CASE</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toUpperCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <label className="block text-sm font-medium text-gray-700">lower case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toLowerCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringCaseConverter; 