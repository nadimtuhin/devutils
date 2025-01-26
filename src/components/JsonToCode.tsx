import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

type Language = 'typescript' | 'python' | 'java' | 'go' | 'swift' | 'csharp';
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export default function JsonToCode() {
  const [json, setJson] = useState('');
  const [language, setLanguage] = useState<Language>('typescript');
  const [code, setCode] = useState('');

  const generateTypescriptInterface = (obj: JsonValue, interfaceName: string = 'Root'): string => {
    if (typeof obj !== 'object' || obj === null) return '';

    const lines: string[] = [`interface ${interfaceName} {`];
    
    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (typeof value[0] === 'object' && value[0] !== null) {
            const arrayInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
            lines.push(`  ${key}: ${arrayInterfaceName}[];`);
            lines.push('}\\n');
            lines.push(generateTypescriptInterface(value[0], arrayInterfaceName));
            continue;
          }
          type = `${typeof value[0]}[]`;
        } else {
          type = 'any[]';
        }
      } else if (type === 'object' && value !== null) {
        const nestedInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        lines.push(`  ${key}: ${nestedInterfaceName};`);
        lines.push('}\\n');
        lines.push(generateTypescriptInterface(value, nestedInterfaceName));
        continue;
      }

      lines.push(`  ${key}: ${type};`);
    }

    if (lines[lines.length - 1] !== '}') {
      lines.push('}');
    }

    return lines.join('\\n');
  };

  const generatePythonClass = (obj: JsonValue, className: string = 'Root'): string => {
    if (typeof obj !== 'object' || obj === null) return '';

    const lines: string[] = [
      'from dataclasses import dataclass',
      'from typing import List, Optional\\n',
      `@dataclass`,
      `class ${className}:`
    ];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      
      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (typeof value[0] === 'object' && value[0] !== null) {
            const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
            lines.push(`    ${key}: List[${arrayClassName}]`);
            lines.push('\\n');
            lines.push(generatePythonClass(value[0], arrayClassName));
            continue;
          }
          type = `List[${typeof value[0]}]`;
        } else {
          type = 'List';
        }
      } else if (type === 'object' && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        lines.push(`    ${key}: ${nestedClassName}`);
        lines.push('\\n');
        lines.push(generatePythonClass(value, nestedClassName));
        continue;
      } else if (type === 'string') {
        type = 'str';
      } else if (type === 'number') {
        type = 'float';
      }

      lines.push(`    ${key}: ${type}`);
    }

    return lines.join('\\n');
  };

  const handleConvert = () => {
    try {
      const parsedJson = JSON.parse(json);
      let converted = '';

      switch (language) {
        case 'typescript':
          converted = generateTypescriptInterface(parsedJson);
          break;
        case 'python':
          converted = generatePythonClass(parsedJson);
          break;
        default:
          converted = '// Conversion for this language is not implemented yet';
      }

      setCode(converted);
    } catch (error) {
      if (error instanceof Error) {
        setCode(`Error: ${error.message}`);
      } else {
        setCode('Error converting JSON');
      }
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">JSON to Code Converter</h2>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="swift">Swift</option>
            <option value="csharp">C#</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">JSON Input</label>
            <CodeEditor
              value={json}
              language="json"
              placeholder="Enter JSON here..."
              onChange={(e) => setJson(e.target.value)}
              padding={15}
              className="h-[500px] font-mono text-sm border border-gray-300 rounded-md"
              style={{
                backgroundColor: '#f9fafb',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Code Output</label>
            <CodeEditor
              value={code}
              language={language}
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
          onClick={handleConvert}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Convert
        </button>
      </div>
    </div>
  );
} 
