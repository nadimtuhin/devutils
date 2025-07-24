import React, { useRef, useState } from 'react';

interface TextAreaWithCopyProps {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  label?: string;
  placeholder?: string;
  error?: string | null;
  readOnly?: boolean;
  className?: string;
  textareaClassName?: string;
}

export const TextAreaWithCopy: React.FC<TextAreaWithCopyProps> = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  readOnly = false,
  className = '',
  textareaClassName = '',
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const timeoutRef = useRef<number | null>(null);

  const handleCopy = async () => {
    if (!value) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // fallback for insecure context or unsupported browsers
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopyStatus('idle'), 1500);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      )}
      <div className="relative flex">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          aria-invalid={!!error}
          className={`w-full h-32 px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
            error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
          } ${readOnly ? 'bg-gray-50 dark:bg-gray-700' : ''} ${textareaClassName}`}
        />
        <button
          type="button"
          onClick={handleCopy}
          className={`absolute right-2 top-2 px-2 py-1 rounded bg-blue-600 dark:bg-blue-500 text-white text-xs font-semibold shadow hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors ${
            copyStatus === 'success'
              ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400'
              : copyStatus === 'error'
              ? 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400'
              : ''
          }`}
          aria-label="Copy to clipboard"
        >
          {copyStatus === 'success' ? 'Copied!' : copyStatus === 'error' ? 'Failed' : 'Copy'}
        </button>
      </div>
      {error && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</div>}
    </div>
  );
}; 