import React, { useState } from 'react';
import { Clock, Code2, FileJson, FileCode, Image, Key, Search, Link, LinkIcon, Code, Braces, Hash, FileText, Diff, FileSpreadsheet, Text, RotateCw, FileCode2, Dices, Braces as Braces2 } from 'lucide-react';
import UnixTimeConverter from './components/UnixTimeConverter';
import JsonValidator from './components/JsonValidator';
import Base64Encoder from './components/Base64Encoder';
import Base64ImageEncoder from './components/Base64ImageEncoder';
import JwtDebugger from './components/JwtDebugger';
import RegexpTester from './components/RegexpTester';
import UrlEncoder from './components/UrlEncoder';
import UrlParser from './components/UrlParser';
import HtmlEntityConverter from './components/HtmlEntityConverter';
import BackslashEncoder from './components/BackslashEncoder';
import UuidGenerator from './components/UuidGenerator';
import HtmlPreview from './components/HtmlPreview';
import TextDiff from './components/TextDiff';
import YamlToJson from './components/YamlToJson';
import NumberBaseConverter from './components/NumberBaseConverter';
import LoremIpsum from './components/LoremIpsum';
import JsonToCsv from './components/JsonToCsv';
import CsvToJson from './components/CsvToJson';
import HashGenerator from './components/HashGenerator';
import HtmlToJsx from './components/HtmlToJsx';

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
};

function App() {
  const [activeTool, setActiveTool] = useState('unix-time');

  const tools: Tool[] = [
    { id: 'unix-time', name: 'Unix Time Converter', icon: <Clock size={20} />, component: <UnixTimeConverter /> },
    { id: 'json-validator', name: 'JSON Validator', icon: <FileJson size={20} />, component: <JsonValidator /> },
    { id: 'base64', name: 'Base64 Encoder/Decoder', icon: <Code2 size={20} />, component: <Base64Encoder /> },
    { id: 'base64-image', name: 'Base64 Image Encoder', icon: <Image size={20} />, component: <Base64ImageEncoder /> },
    { id: 'jwt', name: 'JWT Debugger', icon: <Key size={20} />, component: <JwtDebugger /> },
    { id: 'regexp', name: 'RegExp Tester', icon: <Search size={20} />, component: <RegexpTester /> },
    { id: 'url-encoder', name: 'URL Encoder/Decoder', icon: <Link size={20} />, component: <UrlEncoder /> },
    { id: 'url-parser', name: 'URL Parser', icon: <LinkIcon size={20} />, component: <UrlParser /> },
    { id: 'html-entity', name: 'HTML Entity Converter', icon: <Code size={20} />, component: <HtmlEntityConverter /> },
    { id: 'backslash', name: 'Backslash Encoder', icon: <Braces size={20} />, component: <BackslashEncoder /> },
    { id: 'uuid', name: 'UUID/ULID Generator', icon: <Hash size={20} />, component: <UuidGenerator /> },
    { id: 'html-preview', name: 'HTML Preview', icon: <FileText size={20} />, component: <HtmlPreview /> },
    { id: 'text-diff', name: 'Text Diff Checker', icon: <Diff size={20} />, component: <TextDiff /> },
    { id: 'yaml-json', name: 'YAML to JSON', icon: <FileSpreadsheet size={20} />, component: <YamlToJson /> },
    { id: 'number-base', name: 'Number Base Converter', icon: <Text size={20} />, component: <NumberBaseConverter /> },
    { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', icon: <RotateCw size={20} />, component: <LoremIpsum /> },
    { id: 'json-csv', name: 'JSON to CSV', icon: <FileCode size={20} />, component: <JsonToCsv /> },
    { id: 'csv-json', name: 'CSV to JSON', icon: <FileCode2 size={20} />, component: <CsvToJson /> },
    { id: 'hash', name: 'Hash Generator', icon: <Dices size={20} />, component: <HashGenerator /> },
    { id: 'html-jsx', name: 'HTML to JSX', icon: <Braces2 size={20} />, component: <HtmlToJsx /> }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">DevTools</h1>
        </div>
        <nav className="p-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTool === tool.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tool.icon}
              <span className="text-sm font-medium">{tool.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {tools.find(tool => tool.id === activeTool)?.component}
        </div>
      </div>
    </div>
  );
}

export default App;