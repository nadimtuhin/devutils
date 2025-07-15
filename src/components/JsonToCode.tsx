import { useState, useEffect, useCallback } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { Copy, FileText, Zap, AlertCircle } from "lucide-react";

type Language =
  | "typescript"
  | "python"
  | "java"
  | "go"
  | "swift"
  | "csharp"
  | "php"
  | "kotlin";
type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export default function JsonToCode() {
  const [json, setJson] = useState("");
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("jsonToCode-language");
    return (saved as Language) || "go";
  });
  const [code, setCode] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [autoConvert, setAutoConvert] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [error, setError] = useState("");

  // Sample JSON for demonstration
  const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  },
  "hobbies": ["reading", "swimming", "coding"],
  "projects": [
    {
      "name": "Project A",
      "status": "completed",
      "priority": 1
    },
    {
      "name": "Project B", 
      "status": "in-progress",
      "priority": 2
    }
  ]
}`;

  const generateTypescriptInterface = (
    obj: JsonValue,
    interfaceName: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return "";

    const interfaces: string[] = [];
    const currentInterface: string[] = [`interface ${interfaceName} {`];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (
            typeof value[0] === "object" &&
            value[0] !== null &&
            !Array.isArray(value[0])
          ) {
            const arrayInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
            currentInterface.push(`  ${key}: ${arrayInterfaceName}[];`);
            // Generate nested interface for array items
            const nestedInterface = generateTypescriptInterface(
              value[0],
              arrayInterfaceName
            );
            if (nestedInterface) {
              interfaces.push(nestedInterface);
            }
            continue;
          }
          type = `${typeof value[0]}[]`;
        } else {
          type = "any[]";
        }
      } else if (type === "object" && value !== null) {
        const nestedInterfaceName = `${interfaceName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        currentInterface.push(`  ${key}: ${nestedInterfaceName};`);
        // Generate nested interface
        const nestedInterface = generateTypescriptInterface(
          value,
          nestedInterfaceName
        );
        if (nestedInterface) {
          interfaces.push(nestedInterface);
        }
        continue;
      }

      currentInterface.push(`  ${key}: ${type};`);
    }

    currentInterface.push("}");

    // Put the main interface first, then nested interfaces
    const result = [currentInterface.join("\n")];
    if (interfaces.length > 0) {
      result.push("");
      result.push(...interfaces);
    }

    return result.join("\n");
  };

  const generatePythonClass = (
    obj: JsonValue,
    className: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null) return "";

    const lines: string[] = [
      "from dataclasses import dataclass",
      "from typing import List, Optional\n",
      `@dataclass`,
      `class ${className}:`,
    ];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;

      if (Array.isArray(value)) {
        if (value.length > 0) {
          if (typeof value[0] === "object" && value[0] !== null) {
            const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
            lines.push(`    ${key}: List[${arrayClassName}]`);
            lines.push("\n");
            lines.push(generatePythonClass(value[0], arrayClassName));
            continue;
          }
          type = `List[${typeof value[0]}]`;
        } else {
          type = "List";
        }
      } else if (type === "object" && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        lines.push(`    ${key}: ${nestedClassName}`);
        lines.push("\n");
        lines.push(generatePythonClass(value, nestedClassName));
        continue;
      } else if (type === "string") {
        type = "str";
      } else if (type === "number") {
        type = "float";
      }

      lines.push(`    ${key}: ${type}`);
    }

    return lines.join("\n");
  };

  const generateJavaClass = (
    obj: JsonValue,
    className: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null) return "";

    const lines: string[] = [
      "import com.fasterxml.jackson.annotation.JsonProperty;",
      "import java.util.List;\n",
      `public class ${className} {`,
    ];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null
        ) {
          const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          lines.push(`    @JsonProperty("${key}")`);
          lines.push(`    private List<${arrayClassName}> ${key};\n`);
          lines.push(generateJavaClass(value[0], arrayClassName));
          continue;
        }
        type = "List<Object>";
      } else if (type === "object" && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        lines.push(`    @JsonProperty("${key}")`);
        lines.push(`    private ${nestedClassName} ${key};\n`);
        lines.push(generateJavaClass(value, nestedClassName));
        continue;
      } else if (type === "string") {
        type = "String";
      } else if (type === "number") {
        type = "Double";
      } else if (type === "boolean") {
        type = "Boolean";
      }

      lines.push(`    @JsonProperty("${key}")`);
      lines.push(`    private ${type} ${key};`);
    }

    lines.push("}\n");
    return lines.join("\n");
  };

  const generateGoStruct = (
    obj: JsonValue,
    structName: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return "";

    const structs: string[] = [];
    const currentStruct: string[] = [`type ${structName} struct {`];

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
      let type: string = typeof value;

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null &&
          !Array.isArray(value[0])
        ) {
          const arrayStructName = `${structName}${fieldName}Item`;
          currentStruct.push(
            `    ${fieldName} []${arrayStructName} \`json:"${key}"\``
          );
          // Generate nested struct for array items
          const nestedStruct = generateGoStruct(value[0], arrayStructName);
          if (nestedStruct) {
            structs.push(nestedStruct);
          }
          continue;
        }
        type = "[]interface{}";
      } else if (type === "object" && value !== null) {
        const nestedStructName = `${structName}${fieldName}`;
        currentStruct.push(
          `    ${fieldName} ${nestedStructName} \`json:"${key}"\``
        );
        // Generate nested struct
        const nestedStruct = generateGoStruct(value, nestedStructName);
        if (nestedStruct) {
          structs.push(nestedStruct);
        }
        continue;
      } else if (type === "string") {
        type = "string";
      } else if (type === "number") {
        type = "float64";
      } else if (type === "boolean") {
        type = "bool";
      }

      currentStruct.push(`    ${fieldName} ${type} \`json:"${key}"\``);
    }

    currentStruct.push("}");

    // Put the main struct first, then nested structs
    const result = [currentStruct.join("\n")];
    if (structs.length > 0) {
      result.push("");
      result.push(...structs);
    }

    return result.join("\n");
  };

  const generateSwiftStruct = (
    obj: JsonValue,
    structName: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null) return "";

    const lines: string[] = [
      "import Foundation\n",
      `struct ${structName}: Codable {`,
    ];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null
        ) {
          const arrayStructName = `${structName}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          lines.push(`    let ${key}: [${arrayStructName}]`);
          lines.push("}\n");
          lines.push(generateSwiftStruct(value[0], arrayStructName));
          continue;
        }
        type = "[Any]";
      } else if (type === "object" && value !== null) {
        const nestedStructName = `${structName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        lines.push(`    let ${key}: ${nestedStructName}`);
        lines.push("}\n");
        lines.push(generateSwiftStruct(value, nestedStructName));
        continue;
      } else if (type === "string") {
        type = "String";
      } else if (type === "number") {
        type = "Double";
      } else if (type === "boolean") {
        type = "Bool";
      }

      lines.push(`    let ${key}: ${type}`);
    }

    if (lines[lines.length - 1] !== "}\n") {
      lines.push("}");
    }

    return lines.join("\n");
  };

  const generateCSharpClass = (
    obj: JsonValue,
    className: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null) return "";

    const lines: string[] = [
      "using System.Collections.Generic;",
      "using Newtonsoft.Json;\n",
      `public class ${className}`,
      "{",
    ];

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      const propName = key.charAt(0).toUpperCase() + key.slice(1);

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null
        ) {
          const arrayClassName = `${className}${propName}Item`;
          lines.push(`    [JsonProperty("${key}")]`);
          lines.push(
            `    public List<${arrayClassName}> ${propName} { get; set; }\n`
          );
          lines.push(generateCSharpClass(value[0], arrayClassName));
          continue;
        }
        type = "List<object>";
      } else if (type === "object" && value !== null) {
        const nestedClassName = `${className}${propName}`;
        lines.push(`    [JsonProperty("${key}")]`);
        lines.push(`    public ${nestedClassName} ${propName} { get; set; }\n`);
        lines.push(generateCSharpClass(value, nestedClassName));
        continue;
      } else if (type === "string") {
        type = "string";
      } else if (type === "number") {
        type = "double";
      } else if (type === "boolean") {
        type = "bool";
      }

      lines.push(`    [JsonProperty("${key}")]`);
      lines.push(`    public ${type} ${propName} { get; set; }`);
    }

    lines.push("}\n");
    return lines.join("\n");
  };

  const generatePhpClass = (
    obj: JsonValue,
    className: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return "";

    const classes: string[] = [];
    const currentClass: string[] = ["<?php", "", `class ${className}`, "{"];

    // Add properties
    for (const [key, value] of Object.entries(obj)) {
      const type: string = typeof value;
      let phpType: string = "mixed";

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null &&
          !Array.isArray(value[0])
        ) {
          const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          phpType = `${arrayClassName}[]`;
          currentClass.push(`    /**`);
          currentClass.push(`     * @var ${phpType}`);
          currentClass.push(`     */`);
          currentClass.push(`    public array $${key};`);
          currentClass.push("");
          // Generate nested class for array items
          const nestedClass = generatePhpClass(value[0], arrayClassName);
          if (nestedClass) {
            classes.push(nestedClass);
          }
          continue;
        }
        phpType = "array";
      } else if (type === "object" && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        phpType = nestedClassName;
        currentClass.push(`    /**`);
        currentClass.push(`     * @var ${phpType}`);
        currentClass.push(`     */`);
        currentClass.push(`    public ${phpType} $${key};`);
        currentClass.push("");
        // Generate nested class
        const nestedClass = generatePhpClass(value, nestedClassName);
        if (nestedClass) {
          classes.push(nestedClass);
        }
        continue;
      } else if (type === "string") {
        phpType = "string";
      } else if (type === "number") {
        phpType = "float";
      } else if (type === "boolean") {
        phpType = "bool";
      }

      currentClass.push(`    /**`);
      currentClass.push(`     * @var ${phpType}`);
      currentClass.push(`     */`);
      currentClass.push(
        `    public ${phpType === "array" ? "array" : phpType} $${key};`
      );
      currentClass.push("");
    }

    // Add constructor
    currentClass.push(`    public function __construct(array $data = [])`);
    currentClass.push(`    {`);
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null &&
          !Array.isArray(value[0])
        ) {
          const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          currentClass.push(
            `        $this->${key} = array_map(fn($item) => new ${arrayClassName}($item), $data['${key}'] ?? []);`
          );
        } else {
          currentClass.push(`        $this->${key} = $data['${key}'] ?? [];`);
        }
      } else if (typeof value === "object" && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        currentClass.push(
          `        $this->${key} = new ${nestedClassName}($data['${key}'] ?? []);`
        );
      } else {
        const defaultValue =
          typeof value === "string"
            ? "''"
            : typeof value === "number"
              ? "0"
              : typeof value === "boolean"
                ? "false"
                : "null";
        currentClass.push(
          `        $this->${key} = $data['${key}'] ?? ${defaultValue};`
        );
      }
    }
    currentClass.push(`    }`);

    currentClass.push("}");

    // Put the main class first, then nested classes
    const result = [currentClass.join("\n")];
    if (classes.length > 0) {
      result.push("");
      result.push(...classes);
    }

    return result.join("\n");
  };

  const generateKotlinClass = (
    obj: JsonValue,
    className: string = "Root"
  ): string => {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj))
      return "";

    const classes: string[] = [];
    const currentClass: string[] = [
      "import kotlinx.serialization.Serializable",
      "import kotlinx.serialization.SerialName",
      "",
      "@Serializable",
      `data class ${className}(`
    ];

    const properties: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const type: string = typeof value;
      let kotlinType: string = "Any";

      if (Array.isArray(value)) {
        if (
          value.length > 0 &&
          typeof value[0] === "object" &&
          value[0] !== null &&
          !Array.isArray(value[0])
        ) {
          const arrayClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          kotlinType = `List<${arrayClassName}>`;
          properties.push(`    @SerialName("${key}")`);
          properties.push(`    val ${key}: ${kotlinType}`);
          // Generate nested class for array items
          const nestedClass = generateKotlinClass(value[0], arrayClassName);
          if (nestedClass) {
            classes.push(nestedClass);
          }
          continue;
        }
        kotlinType = "List<Any>";
      } else if (type === "object" && value !== null) {
        const nestedClassName = `${className}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        kotlinType = nestedClassName;
        properties.push(`    @SerialName("${key}")`);
        properties.push(`    val ${key}: ${kotlinType}`);
        // Generate nested class
        const nestedClass = generateKotlinClass(value, nestedClassName);
        if (nestedClass) {
          classes.push(nestedClass);
        }
        continue;
      } else if (type === "string") {
        kotlinType = "String";
      } else if (type === "number") {
        kotlinType = "Double";
      } else if (type === "boolean") {
        kotlinType = "Boolean";
      }

      properties.push(`    @SerialName("${key}")`);
      properties.push(`    val ${key}: ${kotlinType}`);
    }

    // Add properties to class with proper comma separation
    for (let i = 0; i < properties.length; i += 2) {
      currentClass.push(properties[i]); // @SerialName annotation
      const isLast = i + 2 >= properties.length;
      currentClass.push(properties[i + 1] + (isLast ? "" : ",")); // property declaration
    }

    currentClass.push(")");

    // Put the main class first, then nested classes
    const result = [currentClass.join("\n")];
    if (classes.length > 0) {
      result.push("");
      result.push(...classes);
    }

    return result.join("\n");
  };

  const handleConvert = useCallback(() => {
    if (!json.trim()) {
      setError("Please enter JSON data");
      setCode("");
      return;
    }

    try {
      const parsedJson = JSON.parse(json);
      let converted = "";
      setError("");

      switch (language) {
        case "typescript":
          converted = generateTypescriptInterface(parsedJson);
          break;
        case "python":
          converted = generatePythonClass(parsedJson);
          break;
        case "java":
          converted = generateJavaClass(parsedJson);
          break;
        case "go":
          converted = generateGoStruct(parsedJson);
          break;
        case "swift":
          converted = generateSwiftStruct(parsedJson);
          break;
        case "csharp":
          converted = generateCSharpClass(parsedJson);
          break;
        case "php":
          converted = generatePhpClass(parsedJson);
          break;
        case "kotlin":
          converted = generateKotlinClass(parsedJson);
          break;
        default:
          converted = "// Conversion for this language is not implemented yet";
      }

      setCode(converted);
    } catch (error) {
      if (error instanceof Error) {
        setError(`Invalid JSON: ${error.message}`);
        setCode("");
      } else {
        setError("Error converting JSON");
        setCode("");
      }
    }
  });

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const loadSample = () => {
    setJson(sampleJson);
    if (autoConvert) {
      setTimeout(() => handleConvert(), 100);
    }
  };

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("jsonToCode-language", language);
  }, [language]);

  // Auto convert when JSON or language changes
  useEffect(() => {
    if (autoConvert && json.trim()) {
      const timeoutId = setTimeout(() => {
        handleConvert();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [json, language, autoConvert, handleConvert]);

  const addLineNumbers = (text: string): string => {
    if (!showLineNumbers || !text) return text;
    return text
      .split("\n")
      .map(
        (line, index) => `${(index + 1).toString().padStart(3, " ")} | ${line}`
      )
      .join("\n");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">JSON to Code Converter</h2>
        <p className="text-gray-600">
          Convert JSON data to strongly-typed code structures in various
          programming languages
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="language-select"
              className="text-sm font-medium text-gray-700"
            >
              Language:
            </label>
            <select
              id="language-select"
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
              <option value="php">PHP</option>
              <option value="kotlin">Kotlin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto-convert"
              checked={autoConvert}
              onChange={(e) => setAutoConvert(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="auto-convert"
              className="text-sm text-gray-700 flex items-center gap-1"
            >
              <Zap size={16} />
              Auto Convert
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="line-numbers"
              checked={showLineNumbers}
              onChange={(e) => setShowLineNumbers(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="line-numbers" className="text-sm text-gray-700">
              Line Numbers
            </label>
          </div>

          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1"
          >
            <FileText size={16} />
            Load Sample
          </button>

          {!autoConvert && (
            <button
              type="button"
              onClick={handleConvert}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Convert
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <h4 className="text-red-800 font-medium">Conversion Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            JSON Input
          </label>
          <CodeEditor
            value={json}
            language="json"
            placeholder="Enter JSON here or click 'Load Sample' to get started..."
            onChange={(e) => setJson(e.target.value)}
            padding={15}
            className="h-[600px] font-mono text-sm border border-gray-300 rounded-md"
            style={{
              backgroundColor: "#f9fafb",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
            }}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {language.charAt(0).toUpperCase() + language.slice(1)} Output
            </label>
            {code && (
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-1"
              >
                <Copy size={14} />
                Copy
              </button>
            )}
          </div>
          <CodeEditor
            value={showLineNumbers ? addLineNumbers(code) : code}
            language={language}
            readOnly
            padding={15}
            className="h-[600px] font-mono text-sm border border-gray-300 rounded-md bg-gray-50 overflow-auto"
            style={{
              backgroundColor: "#f9fafb",
              fontFamily:
                "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
              overflow: "auto",
            }}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Copy size={16} />
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}
