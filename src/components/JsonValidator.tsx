import { useState, useEffect, useRef } from 'react';
import { Copy, Check, ChevronDown, ChevronRight, Eye, EyeOff, FileText } from 'lucide-react';

interface JsonNode {
  key: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  path: string;
  level: number;
  isCollapsed: boolean;
  hasChildren: boolean;
}

export default function JsonValidator() {
  const [input, setInput] = useState('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'tree'>('formatted');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateAndFormat = () => {
    if (!input.trim()) {
      setError('');
      setParsedJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setParsedJson(parsed);
      setError('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid JSON';
      setError(errorMsg);
      setParsedJson(null);
    }
  };

  useEffect(() => {
    validateAndFormat();
  }, [input]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFormattedJson = () => {
    if (!parsedJson) return '';
    return JSON.stringify(parsedJson, null, 2);
  };

  const buildJsonTree = (obj: any, path = '', level = 0): JsonNode[] => {
    const nodes: JsonNode[] = [];
    
    if (obj === null) {
      return [{
        key: '',
        value: null,
        type: 'null',
        path,
        level,
        isCollapsed: false,
        hasChildren: false
      }];
    }

    if (typeof obj !== 'object') {
      return [{
        key: '',
        value: obj,
        type: typeof obj as any,
        path,
        level,
        isCollapsed: false,
        hasChildren: false
      }];
    }

    const isArray = Array.isArray(obj);
    const entries = isArray ? obj.map((v, i) => [i.toString(), v]) : Object.entries(obj);

    entries.forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      const hasChildren = value !== null && typeof value === 'object';
      
      nodes.push({
        key,
        value,
        type: Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value as any,
        path: currentPath,
        level,
        isCollapsed: collapsedNodes.has(currentPath),
        hasChildren
      });

      if (hasChildren && !collapsedNodes.has(currentPath)) {
        nodes.push(...buildJsonTree(value, currentPath, level + 1));
      }
    });

    return nodes;
  };

  const toggleNode = (path: string) => {
    const newCollapsed = new Set(collapsedNodes);
    if (newCollapsed.has(path)) {
      newCollapsed.delete(path);
    } else {
      newCollapsed.add(path);
    }
    setCollapsedNodes(newCollapsed);
  };

  const renderJsonTree = () => {
    if (!parsedJson) return null;
    
    const nodes = buildJsonTree(parsedJson);
    
    return (
      <div className="font-mono text-sm">
        {nodes.map((node, index) => (
          <div
            key={`${node.path}-${index}`}
            className="flex items-center py-0.5 hover:bg-gray-50"
            style={{ paddingLeft: `${node.level * 20 + 8}px` }}
          >
            {node.hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.path)}
                className="mr-1 p-0.5 hover:bg-gray-200 rounded"
              >
                {node.isCollapsed ? (
                  <ChevronRight size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}
              </button>
            ) : (
              <span className="w-4 mr-1" />
            )}
            
            <span className="text-blue-600 mr-2">"{node.key}":</span>
            
            {node.type === 'string' && (
              <span className="text-green-600">"{node.value}"</span>
            )}
            {node.type === 'number' && (
              <span className="text-purple-600">{node.value}</span>
            )}
            {node.type === 'boolean' && (
              <span className="text-orange-600">{node.value.toString()}</span>
            )}
            {node.type === 'null' && (
              <span className="text-gray-500">null</span>
            )}
            {node.type === 'object' && !node.isCollapsed && (
              <span className="text-gray-600">{'{'}</span>
            )}
            {node.type === 'array' && !node.isCollapsed && (
              <span className="text-gray-600">{'['}</span>
            )}
            {node.hasChildren && node.isCollapsed && (
              <span className="text-gray-400">
                {node.type === 'object' ? '{...}' : '[...]'}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const sampleData = {
    simple: {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
      active: true
    },
    complex: {
      users: [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice@example.com",
          profile: {
            age: 28,
            location: "New York",
            preferences: {
              theme: "dark",
              notifications: true,
              language: "en"
            }
          },
          roles: ["admin", "user"],
          lastLogin: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob@example.com",
          profile: {
            age: 35,
            location: "San Francisco",
            preferences: {
              theme: "light",
              notifications: false,
              language: "en"
            }
          },
          roles: ["user"],
          lastLogin: null
        }
      ],
      metadata: {
        total: 2,
        page: 1,
        limit: 10,
        hasMore: false
      }
    },
    api: {
      status: "success",
      data: {
        products: [
          {
            id: "prod_001",
            name: "Wireless Headphones",
            price: 99.99,
            currency: "USD",
            inStock: true,
            categories: ["electronics", "audio"],
            specifications: {
              battery: "30 hours",
              connectivity: ["bluetooth", "usb-c"],
              weight: "250g"
            },
            reviews: {
              average: 4.5,
              count: 127
            }
          }
        ]
      },
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 50
      },
      timestamp: "2024-01-15T14:22:33.123Z"
    }
  };

  const loadSample = (type: keyof typeof sampleData) => {
    const sample = JSON.stringify(sampleData[type], null, 2);
    setInput(sample);
    setCollapsedNodes(new Set()); // Reset collapsed state
  };

  const renderLineNumbers = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="flex">
        {showLineNumbers && (
          <div className="bg-gray-50 px-2 py-2 border-r border-gray-200 text-gray-500 text-sm font-mono select-none">
            {lines.map((_, index) => (
              <div key={index} className="leading-6">
                {index + 1}
              </div>
            ))}
          </div>
        )}
        <pre className="flex-1 px-3 py-2 overflow-auto leading-6">
          {text}
        </pre>
      </div>
    );
  };

  return (
    <div className="max-w-6xl">
      <h2 className="text-2xl font-bold dark:text-white mb-6">JSON Validator & Formatter</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Input JSON</label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => loadSample('simple')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center space-x-1 text-gray-700 dark:text-gray-300 transition-colors"
                title="Load simple JSON sample"
              >
                <FileText size={12} />
                <span>Simple</span>
              </button>
              <button
                type="button"
                onClick={() => loadSample('complex')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center space-x-1 text-gray-700 dark:text-gray-300 transition-colors"
                title="Load complex JSON sample"
              >
                <FileText size={12} />
                <span>Complex</span>
              </button>
              <button
                type="button"
                onClick={() => loadSample('api')}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center space-x-1 text-gray-700 dark:text-gray-300 transition-colors"
                title="Load API response sample"
              >
                <FileText size={12} />
                <span>API</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 font-mono text-sm resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Paste your JSON here or click a sample button above..."
            />
            {error && (
              <div className="absolute bottom-2 left-2 right-2 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded px-2 py-1 text-red-600 dark:text-red-400 text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {error ? 'Validation Error' : 'Formatted Output'}
            </label>
            <div className="flex items-center space-x-2">
              {!error && parsedJson && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center space-x-1 text-gray-700 dark:text-gray-300 transition-colors"
                    title="Toggle line numbers"
                  >
                    {showLineNumbers ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>Lines</span>
                  </button>
                  <div className="flex bg-gray-100 rounded">
                    <button
                      type="button"
                      onClick={() => setViewMode('formatted')}
                      className={`px-3 py-1 text-xs rounded-l ${
                        viewMode === 'formatted'
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('tree')}
                      className={`px-3 py-1 text-xs rounded-r ${
                        viewMode === 'tree'
                          ? 'bg-blue-500 text-white'
                          : 'hover:bg-gray-200'
                      }`}
                    >
                      Tree
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getFormattedJson())}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs flex items-center space-x-1"
                    title="Copy formatted JSON"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="border border-gray-300 rounded-md h-96 overflow-hidden">
            {error ? (
              <div className="p-4 text-red-600 bg-red-50 h-full">
                <div className="font-semibold mb-2">JSON Validation Error:</div>
                <div className="font-mono text-sm">{error}</div>
              </div>
            ) : parsedJson ? (
              <div className="h-full overflow-auto">
                {viewMode === 'formatted' ? (
                  <div className="text-sm">
                    {renderLineNumbers(getFormattedJson())}
                  </div>
                ) : (
                  <div className="p-2">
                    {renderJsonTree()}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
                Enter JSON to validate and format
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 z-50">
          <Check size={16} />
          <span>JSON copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}