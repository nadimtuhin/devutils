import React, { useState } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function CertificateDecoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const decodeCertificate = (cert: string): string => {
    try {
      // Remove headers and footers and clean whitespace
      const cleanCert = cert
        .replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\\s/g, '');

      // Decode base64 to binary
      const binary = atob(cleanCert);
      
      // Convert binary to hex
      const hex = Array.from(binary)
        .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('');

      // Basic ASN.1 parsing (simplified)
      let result = '';
      let position = 0;

      const readLength = (pos: number): [number, number] => {
        let len = parseInt(hex.substr(pos * 2, 2), 16);
        let bytesRead = 1;

        if (len & 0x80) {
          const lenBytes = len & 0x7f;
          len = parseInt(hex.substr((pos + 1) * 2, lenBytes * 2), 16);
          bytesRead += lenBytes;
        }

        return [len, bytesRead];
      };

      const readString = (pos: number, len: number): string => {
        const bytes = hex.substr(pos * 2, len * 2);
        let str = '';
        for (let i = 0; i < bytes.length; i += 2) {
          str += String.fromCharCode(parseInt(bytes.substr(i, 2), 16));
        }
        return str;
      };

      while (position < binary.length) {
        const tag = parseInt(hex.substr(position * 2, 2), 16);
        position += 1;

        const [length, bytesRead] = readLength(position);
        position += bytesRead;

        switch (tag) {
          case 0x30: // SEQUENCE
            result += 'SEQUENCE\\n';
            break;
          case 0x31: // SET
            result += 'SET\\n';
            break;
          case 0x02: // INTEGER
            result += `INTEGER: ${hex.substr(position * 2, length * 2)}\\n`;
            break;
          case 0x06: // OBJECT IDENTIFIER
            result += `OBJECT IDENTIFIER: ${readString(position, length)}\\n`;
            break;
          case 0x13: // PRINTABLE STRING
          case 0x0C: // UTF8 STRING
          case 0x16: // IA5STRING
            result += `STRING: ${readString(position, length)}\\n`;
            break;
          case 0x17: // UTC TIME
            result += `UTC TIME: ${readString(position, length)}\\n`;
            break;
          default:
            result += `TAG ${tag.toString(16)}: ${hex.substr(position * 2, length * 2)}\\n`;
        }

        position += length;
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        return `Error: ${error.message}`;
      }
      return 'Error decoding certificate';
    }
  };

  const handleDecode = () => {
    const decoded = decodeCertificate(input);
    setOutput(decoded);
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Certificate Decoder</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Certificate Input</label>
          <CodeEditor
            value={input}
            language="text"
            placeholder="Paste your X.509 certificate here..."
            onChange={(e) => setInput(e.target.value)}
            padding={15}
            className="h-[500px] font-mono text-sm border border-gray-300 rounded-md"
            style={{
              backgroundColor: '#f9fafb',
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Decoded Output</label>
          <CodeEditor
            value={output}
            language="text"
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
        onClick={handleDecode}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Decode
      </button>
    </div>
  );
} 