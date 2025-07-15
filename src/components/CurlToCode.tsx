import { useState, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Copy, FileText, AlertCircle, Play, Hash, WrapText } from 'lucide-react';

type Language = 'python' | 'javascript' | 'php' | 'go' | 'java' | 'node' | 'curl' | 'axios-node' | 'axios-browser';

export default function CurlToCode() {
  const [curl, setCurl] = useState('');
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(false);

  const examples = [
    {
      name: 'GET Request',
      curl: `curl -X GET "https://api.github.com/users/octocat" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -H "User-Agent: MyApp/1.0"`
    },
    {
      name: 'POST with JSON',
      curl: `curl -X POST "https://jsonplaceholder.typicode.com/posts" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-token-here" \\
  -d '{"title": "foo", "body": "bar", "userId": 1}'`
    },
    {
      name: 'Form Data',
      curl: `curl -X POST "https://httpbin.org/post" \\
  -H "User-Agent: curl/7.68.0" \\
  -F "name=John Doe" \\
  -F "email=john@example.com" \\
  -F "file=@document.pdf"`
    },
    {
      name: 'Authentication',
      curl: `curl -X GET "https://api.example.com/protected" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" \\
  -H "Accept: application/json"`
    },
    {
      name: 'PUT Request',
      curl: `curl -X PUT "https://api.example.com/users/123" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-api-key" \\
  -d '{"name": "Updated Name", "email": "updated@example.com"}'`
    }
  ];

  // Only auto-convert when language changes (if we have valid curl and existing code)
  useEffect(() => {
    if (curl.trim() && code.trim()) {
      convertCode(curl, language);
    }
  }, [language]);

  const convertCode = async (curlCommand: string, targetLanguage: Language) => {
    if (!curlCommand.trim()) {
      setCode('');
      setError('');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      // Validate cURL command
      if (!curlCommand.toLowerCase().includes('curl')) {
        throw new Error('Invalid cURL command. Please ensure your command starts with "curl".');
      }

      const parsed = parseCurl(curlCommand);
      
      // Validate URL
      if (!parsed.url) {
        throw new Error('No URL found in cURL command. Please include a valid URL.');
      }

      // Validate URL format
      try {
        new URL(parsed.url);
      } catch {
        throw new Error('Invalid URL format. Please provide a valid URL.');
      }

      let converted = '';
      
      switch (targetLanguage) {
        case 'python':
          converted = convertToPython(parsed);
          break;
        case 'javascript':
          converted = convertToJavaScript(parsed);
          break;
        case 'node':
          converted = convertToNode(parsed);
          break;
        case 'php':
          converted = convertToPHP(parsed);
          break;
        case 'go':
          converted = convertToGo(parsed);
          break;
        case 'java':
          converted = convertToJava(parsed);
          break;
        case 'axios-node':
          converted = convertToAxiosNode(parsed);
          break;
        case 'axios-browser':
          converted = convertToAxiosBrowser(parsed);
          break;
        case 'curl':
          converted = curlCommand;
          break;
        default:
          throw new Error(`Conversion for ${targetLanguage} is not implemented yet`);
      }
      
      setCode(converted);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setCode(`// Error: ${errorMessage}`);
    } finally {
      setIsConverting(false);
    }
  };

  const loadExample = (exampleCurl: string) => {
    setCurl(exampleCurl);
    setError('');
  };

  const handleManualConvert = () => {
    if (curl.trim()) {
      convertCode(curl, language);
    }
  };

  const parseCurl = (curlCommand: string) => {
    const trimmed = curlCommand.trim().replace(/\\\s*\n\s*/g, ' '); // Handle line continuations
    
    // Extract URL - handle various formats more robustly
    let url = '';
    
    // Try multiple URL extraction patterns
    const urlPatterns = [
      // Standard: curl "https://example.com"
      /curl\s+['"]([^'"]+)['"]/,
      // With options: curl -X GET "https://example.com"
      /curl\s+(?:-[^\s]+\s+)*['"]([^'"]+)['"]/,
      // Without quotes: curl https://example.com
      /curl\s+(?:-[^\s]+\s+)*(https?:\/\/[^\s]+)/,
      // URL at the end: curl -X GET https://example.com
      /curl\s+.*?(https?:\/\/[^\s'"]+)/,
      // Any URL-like string
      /(https?:\/\/[^\s'"]+)/
    ];
    
    for (const pattern of urlPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        url = match[1];
        break;
      }
    }

    // Extract method
    const methodMatch = trimmed.match(/-X\s+([A-Z]+)/i) || trimmed.match(/--request\s+([A-Z]+)/i);
    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';

    // Extract headers - handle various formats
    const headerPatterns = [
      /-H\s+['"]([^'"]+)['"]/g,
      /--header\s+['"]([^'"]+)['"]/g,
      /-H\s+([^\s]+:[^\s]+)/g
    ];
    
    const headers: Record<string, string> = {};
    headerPatterns.forEach(pattern => {
      const matches = [...trimmed.matchAll(pattern)];
      matches.forEach(match => {
        const headerStr = match[1];
        const colonIndex = headerStr.indexOf(':');
        if (colonIndex > 0) {
          const key = headerStr.substring(0, colonIndex).trim();
          const value = headerStr.substring(colonIndex + 1).trim();
          if (key && value) {
            headers[key] = value;
          }
        }
      });
    });

    // Extract data/body - handle various formats
    const dataPatterns = [
      /(?:--data|--data-raw|-d)\s+['"]([^'"]*)['"]/,
      /(?:--data|--data-raw|-d)\s+([^\s]+)/,
      /--data-binary\s+['"]([^'"]*)['"]/
    ];
    
    let data = '';
    for (const pattern of dataPatterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        data = match[1];
        break;
      }
    }

    // Extract form data
    const formMatches = [...trimmed.matchAll(/(?:--form|-F)\s+['"]([^'"]+)['"]/g)];
    const formData: Record<string, string> = {};
    formMatches.forEach(match => {
      const formStr = match[1];
      const eqIndex = formStr.indexOf('=');
      if (eqIndex > 0) {
        const key = formStr.substring(0, eqIndex).trim();
        const value = formStr.substring(eqIndex + 1).trim();
        if (key && value) {
          formData[key] = value;
        }
      }
    });

    return { url, method, headers, data, formData };
  };

  const convertToPython = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data, formData } = parsed;
    
    let code = 'import requests\n\n';
    
    if (Object.keys(headers).length > 0) {
      code += 'headers = {\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '}\n\n';
    }

    if (Object.keys(formData).length > 0) {
      code += 'data = {\n';
      Object.entries(formData).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '}\n\n';
    } else if (data) {
      code += `data = '${data}'\n\n`;
    }

    code += `response = requests.${method.toLowerCase()}('${url}'`;
    if (Object.keys(headers).length > 0) code += ', headers=headers';
    if (Object.keys(formData).length > 0) code += ', data=data';
    else if (data) code += ', data=data';
    code += ')\n\n';
    code += 'print(response.status_code)\nprint(response.text)';

    return code;
  };

  const convertToJavaScript = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data, formData } = parsed;
    
    let code = `fetch('${url}', {\n  method: '${method}'`;
    
    if (Object.keys(headers).length > 0) {
      code += ',\n  headers: {\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '  }';
    }

    if (Object.keys(formData).length > 0) {
      code += ',\n  body: new FormData()';
      code += '\n});\n\n// Add form data\n';
      Object.entries(formData).forEach(([key, value]) => {
        code += `formData.append('${key}', '${value}');\n`;
      });
    } else if (data) {
      code += `,\n  body: '${data}'`;
    }

    if (!Object.keys(formData).length) {
      code += '\n})';
    }
    
    code += '\n  .then(response => response.text())\n  .then(data => console.log(data))\n  .catch(error => console.error(\'Error:\', error));';

    return code;
  };

  const convertToNode = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data } = parsed;
    
    let code = 'const https = require(\'https\');\nconst http = require(\'http\');\nconst { URL } = require(\'url\');\n\n';
    code += `const url = new URL('${url}');\n`;
    code += 'const client = url.protocol === \'https:\' ? https : http;\n\n';
    
    code += 'const options = {\n';
    code += '  hostname: url.hostname,\n';
    code += '  port: url.port,\n';
    code += '  path: url.pathname + url.search,\n';
    code += `  method: '${method}'`;
    
    if (Object.keys(headers).length > 0) {
      code += ',\n  headers: {\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '  }';
    }
    
    code += '\n};\n\n';
    code += 'const req = client.request(options, (res) => {\n';
    code += '  let data = \'\';\n';
    code += '  res.on(\'data\', (chunk) => data += chunk);\n';
    code += '  res.on(\'end\', () => console.log(data));\n';
    code += '});\n\n';
    
    if (data) {
      code += `req.write('${data}');\n`;
    }
    
    code += 'req.end();';
    
    return code;
  };

  const convertToPHP = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data } = parsed;
    
    let code = '<?php\n\n';
    code += '$ch = curl_init();\n\n';
    code += `curl_setopt($ch, CURLOPT_URL, '${url}');\n`;
    code += 'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n';
    code += `curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${method}');\n`;
    
    if (Object.keys(headers).length > 0) {
      code += '\n$headers = [\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}: ${value}',\n`;
      });
      code += '];\ncurl_setopt($ch, CURLOPT_HTTPHEADER, $headers);\n';
    }
    
    if (data) {
      code += `\ncurl_setopt($ch, CURLOPT_POSTFIELDS, '${data}');\n`;
    }
    
    code += '\n$response = curl_exec($ch);\ncurl_close($ch);\n\necho $response;\n?>';
    
    return code;
  };

  const convertToGo = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data } = parsed;
    
    let code = 'package main\n\nimport (\n    "fmt"\n    "net/http"\n    "strings"\n)\n\nfunc main() {\n';
    
    if (data) {
      code += `    payload := strings.NewReader("${data}")\n`;
    }
    
    code += `    req, _ := http.NewRequest("${method}", "${url}", `;
    code += data ? 'payload' : 'nil';
    code += ')\n\n';
    
    if (Object.keys(headers).length > 0) {
      Object.entries(headers).forEach(([key, value]) => {
        code += `    req.Header.Add("${key}", "${value}")\n`;
      });
      code += '\n';
    }
    
    code += '    res, _ := http.DefaultClient.Do(req)\n';
    code += '    defer res.Body.Close()\n';
    code += '    body, _ := ioutil.ReadAll(res.Body)\n\n';
    code += '    fmt.Println(string(body))\n}';
    
    return code;
  };

  const convertToJava = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data } = parsed;
    
    let code = 'import java.io.*;\nimport java.net.http.*;\nimport java.net.URI;\n\npublic class ApiRequest {\n    public static void main(String[] args) throws Exception {\n';
    code += '        HttpClient client = HttpClient.newHttpClient();\n\n';
    
    code += `        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()\n`;
    code += `            .uri(URI.create("${url}"))\n`;
    code += `            .method("${method}", `;
    
    if (data) {
      code += `HttpRequest.BodyPublishers.ofString("${data}")`;
    } else {
      code += 'HttpRequest.BodyPublishers.noBody()';
    }
    code += ')';
    
    if (Object.keys(headers).length > 0) {
      Object.entries(headers).forEach(([key, value]) => {
        code += `\n            .header("${key}", "${value}")`;
      });
    }
    
    code += ';\n\n        HttpRequest request = requestBuilder.build();\n';
    code += '        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n';
    code += '        System.out.println(response.body());\n    }\n}';
    
    return code;
  };

  const convertToAxiosNode = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data, formData } = parsed;
    
    let code = 'const axios = require(\'axios\');\n\n';
    
    code += 'const config = {\n';
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}'`;
    
    if (Object.keys(headers).length > 0) {
      code += ',\n  headers: {\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '  }';
    }
    
    if (Object.keys(formData).length > 0) {
      code += ',\n  data: {\n';
      Object.entries(formData).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '  }';
    } else if (data) {
      code += `,\n  data: ${data.startsWith('{') || data.startsWith('[') ? data : `'${data}'`}`;
    }
    
    code += '\n};\n\n';
    code += 'axios(config)\n';
    code += '  .then(response => {\n';
    code += '    console.log(response.status);\n';
    code += '    console.log(response.data);\n';
    code += '  })\n';
    code += '  .catch(error => {\n';
    code += '    console.error(error);\n';
    code += '  });';
    
    return code;
  };

  const convertToAxiosBrowser = (parsed: ReturnType<typeof parseCurl>): string => {
    const { url, method, headers, data, formData } = parsed;
    
    let code = '// Make sure to include axios in your HTML:\n';
    code += '// <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>\n\n';
    
    code += 'const config = {\n';
    code += `  method: '${method.toLowerCase()}',\n`;
    code += `  url: '${url}'`;
    
    if (Object.keys(headers).length > 0) {
      code += ',\n  headers: {\n';
      Object.entries(headers).forEach(([key, value]) => {
        code += `    '${key}': '${value}',\n`;
      });
      code += '  }';
    }
    
    if (Object.keys(formData).length > 0) {
      code += ',\n  data: new FormData()';
      code += '\n};\n\n';
      code += '// Add form data\n';
      Object.entries(formData).forEach(([key, value]) => {
        code += `config.data.append('${key}', '${value}');\n`;
      });
      code += '\n';
    } else if (data) {
      code += `,\n  data: ${data.startsWith('{') || data.startsWith('[') ? data : `'${data}'`}`;
      code += '\n};\n\n';
    } else {
      code += '\n};\n\n';
    }
    
    code += 'axios(config)\n';
    code += '  .then(response => {\n';
    code += '    console.log(response.status);\n';
    code += '    console.log(response.data);\n';
    code += '  })\n';
    code += '  .catch(error => {\n';
    code += '    console.error(error);\n';
    code += '  });';
    
    return code;
  };



  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">cURL to Code Converter</h2>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            title="Select output language"
          >
            <option value="python">Python (requests)</option>
            <option value="javascript">JavaScript (fetch)</option>
            <option value="axios-browser">Axios (Browser)</option>
            <option value="axios-node">Axios (Node.js)</option>
            <option value="node">Node.js (http)</option>
            <option value="php">PHP (cURL)</option>
            <option value="go">Go (net/http)</option>
            <option value="java">Java (HttpClient)</option>
            <option value="curl">cURL</option>
          </select>
          
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600">Load Example:</span>
            {examples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => loadExample(example.curl)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                title={`Load ${example.name} example`}
              >
                {example.name}
              </button>
            ))}
          </div>
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
              data-color-mode="dark"
              className="h-[500px] font-mono text-sm border border-gray-300 rounded-md"
              style={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                fontSize: '14px',
                lineHeight: '1.5',
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Code Output</label>
              <div className="flex items-center gap-2">
                {/* Line Numbers Toggle */}
                <button
                  type="button"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                    showLineNumbers 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle line numbers"
                >
                  <Hash size={12} />
                  Lines
                </button>
                
                {/* Line Wrap Toggle */}
                <button
                  type="button"
                  onClick={() => setWrapLines(!wrapLines)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                    wrapLines 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Toggle line wrap"
                >
                  <WrapText size={12} />
                  Wrap
                </button>
                
                {/* Copy Button */}
                {code && (
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <div 
                className="h-[500px] border border-gray-300 rounded-md overflow-auto"
                style={{
                  backgroundColor: '#1e1e1e',
                  fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                }}
              >
                <div className="flex min-h-full">
                  {/* Line Numbers */}
                  {showLineNumbers && (
                    <div 
                      className="flex-shrink-0 px-3 py-4 text-right border-r border-gray-600 select-none"
                      style={{
                        backgroundColor: '#2d2d2d',
                        color: '#858585',
                        fontSize: '14px',
                        lineHeight: '1.6',
                      }}
                    >
                      {code.split('\n').map((_, index) => (
                        <div key={index} className="leading-6">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Code Content */}
                  <div className="flex-1 min-w-0">
                    <pre 
                      className="p-4 m-0 text-sm leading-6"
                      style={{
                        color: '#d4d4d4',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: wrapLines ? 'pre-wrap' : 'pre',
                        wordBreak: wrapLines ? 'break-word' : 'normal',
                        overflowWrap: wrapLines ? 'break-word' : 'normal',
                      }}
                    >
                      <code>{code || '// Generated code will appear here...'}</code>
                    </pre>
                  </div>
                </div>
              </div>
              
              {isConverting && (
                <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-md">
                  <div className="bg-white px-3 py-2 rounded-md shadow-lg flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm text-gray-700">Converting...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Convert Button */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleManualConvert}
            disabled={!curl.trim() || isConverting}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={16} />
            {isConverting ? 'Converting...' : 'Convert to Code'}
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-800 font-medium">Conversion Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Copy size={16} />
          <span>Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
} 