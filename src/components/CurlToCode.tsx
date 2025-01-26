import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

type Language = 'python' | 'javascript' | 'php' | 'go' | 'java';

export default function CurlToCode() {
  const [curl, setCurl] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');

  const convertCurlToPython = (curl: string): string => {
    try {
      // Basic parsing of curl command
      const url = curl.match(/curl ['"]([^'"]+)['"]/)?.[1] || '';
      const method = curl.includes('-X') ? curl.match(/-X\s+(\w+)/)?.[1] || 'GET' : 'GET';
      const headers = [...(curl.matchAll(/-H\s+['"]([^'"]+)['"]/g) || [])].map(m => m[1]);
      const data = curl.match(/--data\s+['"]([^'"]+)['"]/)?.[1] || '';

      // Generate Python code
      return `import requests

headers = {
${headers.map(h => {
  const [key, value] = h.split(': ');
  return `    '${key}': '${value}'`;
}).join(',\n')}
}

${data ? `data = '${data}'\n\n` : ''}response = requests.${method.toLowerCase()}('${url}'${headers.length ? ', headers=headers' : ''}${data ? ', data=data' : ''})

print(response.status_code)
print(response.json())`;
    } catch {
      return '# Error parsing cURL command';
    }
  };

  const convertCurlToJavaScript = (curl: string): string => {
    try {
      const url = curl.match(/curl ['"]([^'"]+)['"]/)?.[1] || '';
      const method = curl.includes('-X') ? curl.match(/-X\s+(\w+)/)?.[1] || 'GET' : 'GET';
      const headers = [...(curl.matchAll(/-H\s+['"]([^'"]+)['"]/g) || [])].map(m => m[1]);
      const data = curl.match(/--data\s+['"]([^'"]+)['"]/)?.[1] || '';

      return `fetch('${url}', {
  method: '${method}',${headers.length ? `
  headers: {
${headers.map(h => {
  const [key, value] = h.split(': ');
  return `    '${key}': '${value}'`;
}).join(',\n')}
  },` : ''}${data ? `
  body: '${data}',` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
    } catch {
      return '// Error parsing cURL command';
    }
  };

  const handleConvert = () => {
    try {
      let converted = '';
      switch (language) {
        case 'python':
          converted = convertCurlToPython(curl);
          break;
        case 'javascript':
          converted = convertCurlToJavaScript(curl);
          break;
        default:
          converted = '// Conversion for this language is not implemented yet';
      }
      setCode(converted);
    } catch (error) {
      setCode('Error converting cURL command');
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">cURL to Code Converter</h2>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="php">PHP</option>
            <option value="go">Go</option>
            <option value="java">Java</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">cURL Command</label>
            <CodeEditor
              value={curl}
              language="shell"
              placeholder="Enter cURL command here..."
              onChange={(e) => setCurl(e.target.value)}
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