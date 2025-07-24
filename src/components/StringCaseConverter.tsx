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
      <h1 className="text-2xl font-bold dark:text-white">String Case Converter</h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-[30vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter text here..."
          />
        </div>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">camelCase</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, camelCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">PascalCase</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, pascalCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">snake_case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, snakeCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">kebab-case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, kebabCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title Case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toTitleCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">UPPER CASE</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toUpperCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">lower case</label>
            <input
              type="text"
              readOnly
              value={convertCase(input, toLowerCase)}
              className="mt-1 w-full p-2 font-mono text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StringCaseConverter; 