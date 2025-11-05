import { useState, useEffect } from "react";
import { Copy, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ValidationIssue {
  line: number;
  type: "error" | "warning";
  message: string;
}

interface MakefileRule {
  target: string;
  dependencies: string[];
  recipes: string[];
  lineNumber: number;
}

export default function MakefileValidator() {
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [rules, setRules] = useState<MakefileRule[]>([]);
  const [viewMode, setViewMode] = useState<"issues" | "structure">("issues");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateMakefile = () => {
    if (!input.trim()) {
      setIssues([]);
      setRules([]);
      setIsValid(null);
      return;
    }

    const lines = input.split("\n");
    const foundIssues: ValidationIssue[] = [];
    const foundRules: MakefileRule[] = [];
    let currentRule: MakefileRule | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for recipe lines first (must start with tab)
      if (line.startsWith("\t")) {
        if (!currentRule) {
          foundIssues.push({
            line: lineNum,
            type: "error",
            message: "Recipe line without a target",
          });
        } else {
          currentRule.recipes.push(line.substring(1));
        }
        continue;
      }

      // Skip empty lines and comments (but not tab-indented ones, which are recipes)
      if (!line.trim() || line.trim().startsWith("#")) {
        if (currentRule) {
          foundRules.push(currentRule);
          currentRule = null;
        }
        continue;
      }

      // Check for target definition (line with colon not in a recipe)
      // Modified regex to match lines starting with : (empty target)
      if ((line.match(/^[^\t]*:/) || line.startsWith(":")) && !line.startsWith("\t")) {
        // Save previous rule
        if (currentRule) {
          foundRules.push(currentRule);
        }

        // Parse target and dependencies
        const colonIndex = line.indexOf(":");
        const target = line.substring(0, colonIndex).trim();
        const depsStr = line.substring(colonIndex + 1).trim();
        const dependencies = depsStr ? depsStr.split(/\s+/) : [];

        // Validate target name
        if (!target) {
          foundIssues.push({
            line: lineNum,
            type: "error",
            message: "Empty target name",
          });
        } else if (target.includes(" ") && !target.includes("%")) {
          foundIssues.push({
            line: lineNum,
            type: "error",
            message: "Target name contains spaces (should be separated into multiple targets or use escaping)",
          });
        }

        currentRule = {
          target,
          dependencies,
          recipes: [],
          lineNumber: lineNum,
        };
      }
      // Check for lines that should be recipes but use spaces
      else if (line.match(/^[ ]{2,}/)) {
        foundIssues.push({
          line: lineNum,
          type: "error",
          message: "Recipe line starts with spaces instead of a tab (Makefiles require tabs for recipes)",
        });
      }
      // Variable assignment
      else if (line.match(/^[A-Za-z_][A-Za-z0-9_]*\s*[:?+]?=/)) {
        // Valid variable assignment
        if (currentRule) {
          foundRules.push(currentRule);
          currentRule = null;
        }

        // Check for common variable issues
        if (line.includes("=") && !line.match(/[:?+]?=/)) {
          foundIssues.push({
            line: lineNum,
            type: "warning",
            message: "Unusual variable assignment syntax",
          });
        }
      }
      // .PHONY and other special targets
      else if (line.match(/^\.[A-Z_]+:/)) {
        // Special target like .PHONY, .SILENT, etc.
        if (currentRule) {
          foundRules.push(currentRule);
          currentRule = null;
        }
      }
      // Include directives
      else if (line.match(/^-?include\s+/)) {
        if (currentRule) {
          foundRules.push(currentRule);
          currentRule = null;
        }
      }
      // Conditional directives
      else if (line.match(/^(ifdef|ifndef|ifeq|ifneq|else|endif)\b/)) {
        // Valid conditional directive
        if (currentRule) {
          foundRules.push(currentRule);
          currentRule = null;
        }
      }
      // Line continuation
      else if (line.trim().endsWith("\\")) {
        // Line continuation is valid, continue to next line
        continue;
      }
      // Unrecognized line format
      else if (line.trim()) {
        foundIssues.push({
          line: lineNum,
          type: "warning",
          message: "Unrecognized line format - may be a syntax error or continuation",
        });
      }
    }

    // Save last rule
    if (currentRule) {
      foundRules.push(currentRule);
    }

    // Check for common Makefile issues
    for (const rule of foundRules) {
      if (rule.recipes.length === 0 && !rule.target.startsWith(".")) {
        foundIssues.push({
          line: rule.lineNumber,
          type: "warning",
          message: `Target "${rule.target}" has no recipes`,
        });
      }
    }

    setIssues(foundIssues);
    setRules(foundRules);
    setIsValid(foundIssues.filter((i) => i.type === "error").length === 0);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateMakefile();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [input]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(input);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([input], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Makefile";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = () => {
    const sample = `# Sample Makefile
CC = gcc
CFLAGS = -Wall -Wextra -O2
TARGET = myprogram
SOURCES = main.c utils.c helper.c
OBJECTS = $(SOURCES:.c=.o)

.PHONY: all clean install

all: $(TARGET)

$(TARGET): $(OBJECTS)
\t$(CC) $(CFLAGS) -o $@ $^

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f $(OBJECTS) $(TARGET)

install: $(TARGET)
\tcp $(TARGET) /usr/local/bin/

test: $(TARGET)
\t./$(TARGET) --test

run: $(TARGET)
\t./$(TARGET)`;
    setInput(sample);
  };

  const renderLineNumbers = () => {
    const lineCount = input.split("\n").length;
    return (
      <div className="absolute left-0 top-0 pt-3 pb-3 pl-3 pr-2 bg-gray-50 border-r border-gray-300 select-none text-gray-500 text-sm font-mono leading-6">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className="text-right">
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Makefile Validator</h1>
        <p className="text-gray-600">
          Validate Makefile syntax, check for common errors, and analyze structure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Input</h2>
            <div className="flex gap-2">
              <button
                onClick={loadSample}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Load Sample
              </button>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Copy to clipboard"
              >
                <Copy size={18} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Download Makefile"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="relative">
            {showLineNumbers && renderLineNumbers()}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your Makefile here..."
              className={`w-full h-[600px] p-3 border border-gray-300 rounded font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                showLineNumbers ? "pl-16" : ""
              }`}
              spellCheck={false}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show line numbers</span>
            </label>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Validation Results</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("issues")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  viewMode === "issues"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Issues
              </button>
              <button
                onClick={() => setViewMode("structure")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  viewMode === "structure"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Structure
              </button>
            </div>
          </div>

          {/* Validation Status */}
          {isValid !== null && (
            <div
              className={`p-4 rounded-lg flex items-center gap-2 ${
                isValid
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {isValid ? (
                <>
                  <CheckCircle size={20} />
                  <span className="font-medium">Valid Makefile</span>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span className="font-medium">
                    {issues.filter((i) => i.type === "error").length} error(s) found
                  </span>
                </>
              )}
            </div>
          )}

          {/* Issues View */}
          {viewMode === "issues" && (
            <div className="border border-gray-300 rounded h-[600px] overflow-y-auto bg-white">
              {issues.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {input.trim() ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle size={48} className="text-green-500" />
                      <p>No issues found!</p>
                    </div>
                  ) : (
                    <p>Enter a Makefile to validate</p>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-4 flex items-start gap-3 ${
                        issue.type === "error"
                          ? "bg-red-50 border-l-4 border-red-500"
                          : "bg-yellow-50 border-l-4 border-yellow-500"
                      }`}
                    >
                      {issue.type === "error" ? (
                        <XCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-medium">
                            Line {issue.line}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              issue.type === "error"
                                ? "bg-red-200 text-red-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{issue.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Structure View */}
          {viewMode === "structure" && (
            <div className="border border-gray-300 rounded h-[600px] overflow-y-auto bg-white p-4">
              {rules.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {input.trim() ? (
                    <p>No rules found in Makefile</p>
                  ) : (
                    <p>Enter a Makefile to analyze structure</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Found {rules.length} rule{rules.length !== 1 ? "s" : ""}
                  </div>
                  {rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-mono font-semibold text-blue-600">
                          {rule.target}
                        </h3>
                        <span className="text-xs text-gray-500 font-mono">
                          Line {rule.lineNumber}
                        </span>
                      </div>
                      {rule.dependencies.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Dependencies:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rule.dependencies.map((dep, depIdx) => (
                              <span
                                key={depIdx}
                                className="text-xs bg-white border border-gray-300 rounded px-2 py-1 font-mono"
                              >
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {rule.recipes.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Recipes:
                          </span>
                          <div className="mt-1 bg-white rounded border border-gray-300 p-2">
                            {rule.recipes.map((recipe, recipeIdx) => (
                              <div
                                key={recipeIdx}
                                className="font-mono text-sm text-gray-700"
                              >
                                {recipe}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
