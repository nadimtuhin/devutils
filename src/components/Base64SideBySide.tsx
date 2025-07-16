import React, { useCallback, useRef, useState } from "react";
import { encodeBase64, decodeBase64 } from "../utils/base64";
import { Copy, Hash, RotateCcw } from "lucide-react";

// Track which field was last modified
type LastEdited = "plain" | "base64" | null;

interface LineNumberedTextAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  error?: string | null;
  label: string;
  showLineNumbers: boolean;
  onCopy: () => void;
  copyStatus: "idle" | "success" | "error";
}

const LineNumberedTextArea: React.FC<LineNumberedTextAreaProps> = ({
  value,
  onChange,
  placeholder,
  error,
  label,
  showLineNumbers,
  onCopy,
  copyStatus,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 1);

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
            copyStatus === "success"
              ? "bg-green-100 text-green-700 border border-green-300"
              : copyStatus === "error"
                ? "bg-red-100 text-red-700 border border-red-300"
                : value
                  ? "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300"
                  : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
        >
          <Copy size={12} />
          {copyStatus === "success"
            ? "Copied!"
            : copyStatus === "error"
              ? "Failed"
              : "Copy"}
        </button>
      </div>
      <div
        className={`relative flex border rounded-lg shadow-sm overflow-hidden ${
          error ? "border-red-300" : "border-gray-300"
        }`}
      >
        {showLineNumbers && (
          <div
            ref={lineNumbersRef}
            className="flex-shrink-0 w-12 bg-gray-50 border-r border-gray-200 overflow-hidden text-right pr-2 py-3 font-mono text-xs text-gray-500 select-none"
            style={{ height: "200px" }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="leading-5 h-5">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onScroll={handleScroll}
          className={`flex-1 p-3 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            showLineNumbers ? "pl-3" : "pl-3"
          }`}
          style={{ height: "200px", lineHeight: "20px" }}
        />
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <div className="w-1 h-1 bg-red-600 rounded-full"></div>
          {error}
        </div>
      )}
    </div>
  );
};

export const Base64SideBySide: React.FC = () => {
  const [plain, setPlain] = useState("");
  const [base64, setBase64] = useState("");
  const [plainError, setPlainError] = useState<string | null>(null);
  const [base64Error, setBase64Error] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<LastEdited>(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [plainCopyStatus, setPlainCopyStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [base64CopyStatus, setBase64CopyStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const plainRef = useRef<HTMLTextAreaElement>(null);
  const base64Ref = useRef<HTMLTextAreaElement>(null);

  // Toast notification helper
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Copy functionality
  const handleCopy = async (text: string, type: "plain" | "base64") => {
    if (!text) return;

    const setCopyStatus =
      type === "plain" ? setPlainCopyStatus : setBase64CopyStatus;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure context
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyStatus("success");
      showToastMessage(
        `${type === "plain" ? "Plain text" : "Base64"} copied to clipboard!`
      );
    } catch (err) {
      setCopyStatus("error");
      showToastMessage(
        `Failed to copy ${type === "plain" ? "plain text" : "Base64"}`
      );
    }

    setTimeout(() => setCopyStatus("idle"), 1500);
  };

  // Conversion logic
  const handlePlainChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setPlain(value);
      setLastEdited("plain");
      try {
        setBase64(encodeBase64(value));
        setBase64Error(null);
      } catch (err: any) {
        setBase64("");
        setBase64Error(err.message);
      }
      setPlainError(null);
    },
    []
  );

  const handleBase64Change = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setBase64(value);
      setLastEdited("base64");
      try {
        setPlain(decodeBase64(value));
        setPlainError(null);
      } catch (err: any) {
        setPlain("");
        setPlainError(err.message);
      }
      setBase64Error(null);
    },
    []
  );

  // Clear all fields and errors
  const handleClear = () => {
    setPlain("");
    setBase64("");
    setPlainError(null);
    setBase64Error(null);
    setLastEdited(null);
    setPlainCopyStatus("idle");
    setBase64CopyStatus("idle");
    setTimeout(() => {
      plainRef.current?.focus();
    }, 0);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Base64 Encoder/Decoder
        </h2>
        <p className="text-gray-600 text-sm">
          Convert text to Base64 encoding and decode Base64 back to plain text
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              showLineNumbers
                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            <Hash size={14} />
            Line Numbers
          </button>

          <div className="text-xs text-gray-500">
            {plain.length > 0 && (
              <span>
                {plain.split("\n").length} lines, {plain.length} characters
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          <RotateCcw size={14} />
          Clear All
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineNumberedTextArea
          value={plain}
          onChange={handlePlainChange}
          placeholder="Enter text to encode to Base64..."
          error={plainError}
          label="Plain Text"
          showLineNumbers={showLineNumbers}
          onCopy={() => handleCopy(plain, "plain")}
          copyStatus={plainCopyStatus}
        />

        <LineNumberedTextArea
          value={base64}
          onChange={handleBase64Change}
          placeholder="Enter Base64 to decode to plain text..."
          error={base64Error}
          label="Base64 Encoded"
          showLineNumbers={showLineNumbers}
          onCopy={() => handleCopy(base64, "base64")}
          copyStatus={base64CopyStatus}
        />
      </div>

      {/* Usage Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How to use:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>
            • Type or paste text in the Plain Text area to encode it to Base64
          </li>
          <li>
            • Type or paste Base64 in the Base64 area to decode it to plain text
          </li>
          <li>• Use the copy buttons to copy the content to your clipboard</li>
          <li>• Toggle line numbers on/off for better readability</li>
        </ul>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
          <div className="w-5 h-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Copy size={12} />
          </div>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
