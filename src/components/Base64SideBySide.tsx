import React, { useCallback, useRef, useState } from 'react';
import { encodeBase64, decodeBase64 } from '../utils/base64';
import { TextAreaWithCopy } from './TextAreaWithCopy';

// Track which field was last modified
type LastEdited = 'plain' | 'base64' | null;

export const Base64SideBySide: React.FC = () => {
  const [plain, setPlain] = useState('');
  const [base64, setBase64] = useState('');
  const [plainError, setPlainError] = useState<string | null>(null);
  const [base64Error, setBase64Error] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<LastEdited>(null);

  const plainRef = useRef<HTMLTextAreaElement>(null);
  const base64Ref = useRef<HTMLTextAreaElement>(null);

  // Conversion logic
  const handlePlainChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPlain(value);
    setLastEdited('plain');
    try {
      setBase64(encodeBase64(value));
      setBase64Error(null);
    } catch (err: any) {
      setBase64('');
      setBase64Error(err.message);
    }
    setPlainError(null);
  }, []);

  const handleBase64Change = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBase64(value);
    setLastEdited('base64');
    try {
      setPlain(decodeBase64(value));
      setPlainError(null);
    } catch (err: any) {
      setPlain('');
      setPlainError(err.message);
    }
    setBase64Error(null);
  }, []);

  // Clear all fields and errors
  const handleClear = () => {
    setPlain('');
    setBase64('');
    setPlainError(null);
    setBase64Error(null);
    setLastEdited(null);
    setTimeout(() => {
      plainRef.current?.focus();
    }, 0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Base64 Side-by-Side Converter</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <TextAreaWithCopy
            value={plain}
            onChange={handlePlainChange}
            label="Plain Text"
            placeholder="Enter text to encode..."
            error={plainError}
            textareaClassName="h-40"
          />
        </div>
        <div className="flex-1">
          <TextAreaWithCopy
            value={base64}
            onChange={handleBase64Change}
            label="Base64"
            placeholder="Enter Base64 to decode..."
            error={base64Error}
            textareaClassName="h-40"
          />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}; 