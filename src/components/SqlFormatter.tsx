import React, { useState, useCallback } from "react";
import { format } from "sql-formatter";
import { Copy, Download, Upload, Settings, RotateCcw } from "lucide-react";

interface FormatOptions {
  language: string;
  linesBetweenQueries: number;
  keywordCase: "preserve" | "upper" | "lower";
  dataTypeCase: "preserve" | "upper" | "lower";
  functionCase: "preserve" | "upper" | "lower";
  tabWidth: number;
  useTabs: boolean;
  denseOperators: boolean;
  showLineNumbers: boolean;
}

const SqlFormatter = () => {
  const [sql, setSql] = useState("");
  const [formattedSql, setFormattedSql] = useState("");
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [options, setOptions] = useState<FormatOptions>({
    language: "sql",
    linesBetweenQueries: 2,
    keywordCase: "upper",
    dataTypeCase: "upper",
    functionCase: "upper",
    tabWidth: 2,
    useTabs: false,
    denseOperators: false,
    showLineNumbers: true,
  });

  const sqlDialects = [
    { value: "sql", label: "Standard SQL" },
    { value: "mysql", label: "MySQL" },
    { value: "postgresql", label: "PostgreSQL" },
    { value: "sqlite", label: "SQLite" },
    { value: "mariadb", label: "MariaDB" },
    { value: "bigquery", label: "BigQuery" },
    { value: "snowflake", label: "Snowflake" },
    { value: "redshift", label: "Redshift" },
    { value: "spark", label: "Spark SQL" },
    { value: "tsql", label: "T-SQL (SQL Server)" },
    { value: "plsql", label: "PL/SQL (Oracle)" },
  ];

  const formatSql = useCallback(
    (input: string, formatOptions = options) => {
      try {
        if (!input.trim()) {
          setFormattedSql("");
          setError("");
          return;
        }

        const formatted = format(input, {
          language: formatOptions.language as any,
          linesBetweenQueries: formatOptions.linesBetweenQueries,
          tabWidth: formatOptions.tabWidth,
          useTabs: formatOptions.useTabs,
          keywordCase: formatOptions.keywordCase as any,
          dataTypeCase: formatOptions.dataTypeCase as any,
          functionCase: formatOptions.functionCase as any,
          denseOperators: formatOptions.denseOperators,
        });
        setFormattedSql(formatted);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to format SQL");
        setFormattedSql("");
      }
    },
    [options]
  );

  const handleInputChange = (value: string) => {
    setSql(value);
    formatSql(value);
  };

  const handleOptionChange = (key: keyof FormatOptions, value: any) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (sql.trim()) {
      formatSql(sql, newOptions);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const downloadSql = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleInputChange(content);
      };
      reader.readAsText(file);
    }
  };

  const clearAll = () => {
    setSql("");
    setFormattedSql("");
    setError("");
  };

  const renderFormattedSql = () => {
    if (!formattedSql) {
      return (
        <div className="w-full h-[60vh] p-4 font-mono text-sm border rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
          Formatted SQL will appear here...
        </div>
      );
    }

    const lines = formattedSql.split("\n");
    const maxLineNumberWidth = lines.length.toString().length;

    if (!options.showLineNumbers) {
      return (
        <textarea
          value={formattedSql}
          readOnly
          className="w-full h-[60vh] p-4 font-mono text-sm border rounded-lg bg-gray-50 resize-none"
        />
      );
    }

    return (
      <div className="w-full h-[60vh] border rounded-lg bg-gray-50 overflow-auto">
        <div className="flex">
          {/* Line numbers column */}
          <div className="bg-gray-100 border-r border-gray-300 px-2 py-4 select-none">
            {lines.map((_, index) => (
              <div
                key={index}
                className="font-mono text-xs text-gray-500 text-right leading-5"
                style={{ minWidth: `${maxLineNumberWidth * 0.6 + 0.5}rem` }}
              >
                {index + 1}
              </div>
            ))}
          </div>
          {/* Code content */}
          <div className="flex-1 p-4 font-mono text-sm overflow-x-auto">
            {lines.map((line, index) => (
              <div key={index} className="leading-5 whitespace-pre">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const sampleQueries = [
    {
      name: "Basic SELECT",
      query:
        "select id,name,email from users where status=1 and created_at>'2023-01-01' order by name;",
    },
    {
      name: "Complex JOIN",
      query:
        "select u.name,p.title,c.name as category from users u inner join posts p on u.id=p.user_id left join categories c on p.category_id=c.id where u.status=1 and p.published=true order by p.created_at desc limit 10;",
    },
    {
      name: "Subquery",
      query:
        "select * from products where price>(select avg(price) from products where category_id=1) and stock>0;",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SQL Formatter</h1>
        <div className="flex items-center gap-2">
          <select
            value={options.language}
            onChange={(e) => handleOptionChange("language", e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
            title="Select SQL dialect"
            aria-label="SQL dialect selector"
          >
            {sqlDialects.map((dialect) => (
              <option key={dialect.value} value={dialect.value}>
                {dialect.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 border rounded-md hover:bg-gray-50"
            title="Settings"
            aria-label="Toggle formatting settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
          <h3 className="font-semibold">Formatting Options</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Keyword Case
              </label>
              <select
                value={options.keywordCase}
                onChange={(e) =>
                  handleOptionChange("keywordCase", e.target.value)
                }
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="preserve">Preserve</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Function Case
              </label>
              <select
                value={options.functionCase}
                onChange={(e) =>
                  handleOptionChange("functionCase", e.target.value)
                }
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="upper">UPPERCASE</option>
                <option value="lower">lowercase</option>
                <option value="preserve">Preserve</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tab Width
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={options.tabWidth}
                onChange={(e) =>
                  handleOptionChange("tabWidth", parseInt(e.target.value))
                }
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Lines Between Queries
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={options.linesBetweenQueries}
                onChange={(e) =>
                  handleOptionChange(
                    "linesBetweenQueries",
                    parseInt(e.target.value)
                  )
                }
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useTabs"
                checked={options.useTabs}
                onChange={(e) =>
                  handleOptionChange("useTabs", e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="useTabs" className="text-sm">
                Use Tabs
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="denseOperators"
                checked={options.denseOperators}
                onChange={(e) =>
                  handleOptionChange("denseOperators", e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="denseOperators" className="text-sm">
                Dense Operators
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLineNumbers"
                checked={options.showLineNumbers}
                onChange={(e) =>
                  handleOptionChange("showLineNumbers", e.target.checked)
                }
                className="mr-2"
              />
              <label htmlFor="showLineNumbers" className="text-sm">
                Show Line Numbers
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-600">Sample queries:</span>
        {sampleQueries.map((sample, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleInputChange(sample.query)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            title={`Load ${sample.name} sample query`}
          >
            {sample.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Input SQL</label>
            <div className="flex gap-1">
              <input
                type="file"
                accept=".sql,.txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="p-1 border rounded hover:bg-gray-50 cursor-pointer"
                title="Upload SQL file"
              >
                <Upload size={14} />
              </label>
              <button
                type="button"
                onClick={clearAll}
                className="p-1 border rounded hover:bg-gray-50"
                title="Clear all"
                aria-label="Clear all content"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
          <textarea
            value={sql}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full h-[60vh] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Enter SQL query here..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Formatted SQL</label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => copyToClipboard(formattedSql)}
                className="p-1 border rounded hover:bg-gray-50"
                title="Copy to clipboard"
                aria-label="Copy formatted SQL to clipboard"
                disabled={!formattedSql}
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={() => downloadSql(formattedSql, "formatted.sql")}
                className="p-1 border rounded hover:bg-gray-50"
                title="Download SQL"
                aria-label="Download formatted SQL as file"
                disabled={!formattedSql}
              >
                <Download size={14} />
              </button>
            </div>
          </div>
          {renderFormattedSql()}
          {error && (
            <div className="mt-2 p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>
          • Supports multiple SQL dialects including MySQL, PostgreSQL, SQLite,
          and more
        </p>
        <p>• Real-time formatting with customizable options</p>
        <p>• Upload SQL files or copy/download formatted results</p>
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
};

export default SqlFormatter;
