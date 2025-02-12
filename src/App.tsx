import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link as RouterLink, useLocation, Navigate } from 'react-router-dom';
import { Clock, Code2, FileJson, FileCode, Image, Key, Search, Link as LinkIcon, Code, Braces, Hash, FileText, Diff, FileSpreadsheet, Text, RotateCw, FileCode2, Dices, Braces as Braces2, FileDown, Database, Type, Timer, Palette, ArrowLeftRight, Binary, FileImage, Terminal, Code as Code3, Shield, Sigma, ListFilter, FileType, Keyboard, Github, Star, Info, PanelLeftClose, PanelLeft } from 'lucide-react';
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
import MarkdownPreview from './components/MarkdownPreview';
import SqlFormatter from './components/SqlFormatter';
import StringCaseConverter from './components/StringCaseConverter';
import CronJobParser from './components/CronJobParser';
import ColorConverter from './components/ColorConverter';
import PhpJsonConverter from './components/PhpJsonConverter';
import PhpSerializer from './components/PhpSerializer';
import SvgToCss from './components/SvgToCss';
import CurlToCode from './components/CurlToCode';
import JsonToCode from './components/JsonToCode';
import CertificateDecoder from './components/CertificateDecoder';
import HexAsciiConverter from './components/HexAsciiConverter';
import LineSorter from './components/LineSorter';
import CssMinifyBeautify from './components/CssMinifyBeautify';
import JavaScriptMinifyBeautify from './components/JavaScriptMinifyBeautify';
import HtmlMinifyBeautify from './components/HtmlMinifyBeautify';
import SpotlightSearch from './components/SpotlightSearch';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import Credits from './components/Credits';

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  url: string;
  isEnabled: boolean;
};

function Layout({ tools }: { tools: Tool[] }) {
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Control + K for spotlight
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      // Control + Shift + P for spotlight
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      // Command/Control + ? for shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${isSidebarExpanded ? 'w-64' : 'w-16'} bg-white shadow-lg overflow-y-auto flex flex-col transition-all duration-200 ease-in-out`}>
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            {isSidebarExpanded ? (
              <RouterLink to="/" className="text-xl font-bold text-gray-800 no-underline">DevUtils</RouterLink>
            ) : (
              <button
                onClick={() => setIsSidebarExpanded(true)}
                className="w-full flex justify-center hover:bg-gray-100 rounded p-1"
                title="Expand Sidebar"
              >
                <PanelLeft size={20} />
              </button>
            )}
            <div className="flex space-x-2">
              {isSidebarExpanded && (
                <>
                  <button
                    onClick={() => setIsSpotlightOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Search (⌘K)"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={() => setIsShortcutsOpen(true)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Keyboard Shortcuts (⌘?)"
                  >
                    <Keyboard size={18} />
                  </button>
                  <button
                    onClick={() => setIsSidebarExpanded(false)}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Collapse Sidebar"
                  >
                    <PanelLeftClose size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          {isSidebarExpanded && (
            <div className="flex space-x-2">
              <a
                href="https://github.com/nadimtuhin/devutils"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-blue-600"
              >
                <Github size={16} />
                <span>Repository</span>
              </a>
              <a
                href="https://github.com/nadimtuhin/devutils/stargazers"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-2 py-1 text-sm text-gray-600 hover:text-blue-600"
              >
                <Star size={16} />
                <span>Star</span>
              </a>
            </div>
          )}
        </div>
        <nav className="p-2 flex-1">
          {tools.filter(tool => tool.isEnabled).map((tool) => (
            <RouterLink
              key={tool.id}
              to={tool.url}
              className={`w-full flex items-center ${isSidebarExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg transition-colors ${
                currentPath === tool.url
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              } no-underline`}
              title={!isSidebarExpanded ? tool.name : undefined}
            >
              {tool.icon}
              {isSidebarExpanded && <span className="text-sm font-medium">{tool.name}</span>}
            </RouterLink>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/unix-time" replace />} />
            {tools.map(tool => (
              <Route
                key={tool.id}
                path={tool.url}
                element={
                  tool.isEnabled ? (
                    tool.component
                  ) : (
                    <div className="text-center text-gray-500 mt-8">
                      This tool is currently disabled
                    </div>
                  )
                }
              />
            ))}
          </Routes>
        </div>
      </div>

      {/* Spotlight Search */}
      <SpotlightSearch
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        tools={tools}
      />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

function App() {
  const tools: Tool[] = [
    { id: 'css-minify-beautify', name: 'CSS Minify/Beautify', icon: <FileType size={20} />, component: <CssMinifyBeautify />, url: '/css-minify-beautify', isEnabled: true },
    { id: 'js-minify-beautify', name: 'JavaScript Minify/Beautify', icon: <Code3 size={20} />, component: <JavaScriptMinifyBeautify />, url: '/js-minify-beautify', isEnabled: true },
    { id: 'html-minify-beautify', name: 'HTML Minify/Beautify', icon: <FileText size={20} />, component: <HtmlMinifyBeautify />, url: '/html-minify-beautify', isEnabled: true },
    { id: 'markdown-preview', name: 'Markdown Preview', icon: <FileDown size={20} />, component: <MarkdownPreview />, url: '/markdown-preview', isEnabled: true },
    { id: 'sql-formatter', name: 'SQL Formatter', icon: <Database size={20} />, component: <SqlFormatter />, url: '/sql-formatter', isEnabled: true },
    { id: 'string-case', name: 'String Case Converter', icon: <Type size={20} />, component: <StringCaseConverter />, url: '/string-case', isEnabled: true },
    { id: 'cron-parser', name: 'Cron Job Parser', icon: <Timer size={20} />, component: <CronJobParser />, url: '/cron-parser', isEnabled: true },
    { id: 'color-converter', name: 'Color Converter', icon: <Palette size={20} />, component: <ColorConverter />, url: '/color-converter', isEnabled: true },
    { id: 'php-json', name: 'PHP ↔ JSON', icon: <ArrowLeftRight size={20} />, component: <PhpJsonConverter />, url: '/php-json', isEnabled: true },
    { id: 'php-serializer', name: 'PHP Serializer', icon: <Binary size={20} />, component: <PhpSerializer />, url: '/php-serializer', isEnabled: true },
    { id: 'svg-css', name: 'SVG to CSS', icon: <FileImage size={20} />, component: <SvgToCss />, url: '/svg-css', isEnabled: true },
    { id: 'curl-code', name: 'cURL to Code', icon: <Terminal size={20} />, component: <CurlToCode />, url: '/curl-code', isEnabled: true },
    { id: 'json-code', name: 'JSON to Code', icon: <Code3 size={20} />, component: <JsonToCode />, url: '/json-code', isEnabled: true },
    { id: 'cert-decoder', name: 'Certificate Decoder', icon: <Shield size={20} />, component: <CertificateDecoder />, url: '/cert-decoder', isEnabled: true },
    { id: 'hex-ascii', name: 'Hex ↔ ASCII', icon: <Sigma size={20} />, component: <HexAsciiConverter />, url: '/hex-ascii', isEnabled: true },
    { id: 'line-sorter', name: 'Line Sort/Dedupe', icon: <ListFilter size={20} />, component: <LineSorter />, url: '/line-sorter', isEnabled: true },
    { id: 'unix-time', name: 'Unix Time Converter', icon: <Clock size={20} />, component: <UnixTimeConverter />, url: '/unix-time', isEnabled: true },
    { id: 'json-validator', name: 'JSON Validator', icon: <FileJson size={20} />, component: <JsonValidator />, url: '/json-validator', isEnabled: true },
    { id: 'base64', name: 'Base64 Encoder/Decoder', icon: <Code2 size={20} />, component: <Base64Encoder />, url: '/base64', isEnabled: true },
    { id: 'base64-image', name: 'Base64 Image Encoder', icon: <Image size={20} />, component: <Base64ImageEncoder />, url: '/base64-image', isEnabled: true },
    { id: 'jwt', name: 'JWT Debugger', icon: <Key size={20} />, component: <JwtDebugger />, url: '/jwt', isEnabled: true },
    { id: 'regexp', name: 'RegExp Tester', icon: <Search size={20} />, component: <RegexpTester />, url: '/regexp', isEnabled: true },
    { id: 'url-encoder', name: 'URL Encoder/Decoder', icon: <LinkIcon size={20} />, component: <UrlEncoder />, url: '/url-encoder', isEnabled: true },
    { id: 'url-parser', name: 'URL Parser', icon: <LinkIcon size={20} />, component: <UrlParser />, url: '/url-parser', isEnabled: true },
    { id: 'html-entity', name: 'HTML Entity Converter', icon: <Code size={20} />, component: <HtmlEntityConverter />, url: '/html-entity', isEnabled: true },
    { id: 'backslash', name: 'Backslash Encoder', icon: <Braces size={20} />, component: <BackslashEncoder />, url: '/backslash', isEnabled: true },
    { id: 'uuid', name: 'UUID/ULID Generator', icon: <Hash size={20} />, component: <UuidGenerator />, url: '/uuid', isEnabled: true },
    { id: 'html-preview', name: 'HTML Preview', icon: <FileText size={20} />, component: <HtmlPreview />, url: '/html-preview', isEnabled: true },
    { id: 'text-diff', name: 'Text Diff Checker', icon: <Diff size={20} />, component: <TextDiff />, url: '/text-diff', isEnabled: true },
    { id: 'yaml-json', name: 'YAML to JSON', icon: <FileSpreadsheet size={20} />, component: <YamlToJson />, url: '/yaml-json', isEnabled: true },
    { id: 'number-base', name: 'Number Base Converter', icon: <Text size={20} />, component: <NumberBaseConverter />, url: '/number-base', isEnabled: true },
    { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', icon: <RotateCw size={20} />, component: <LoremIpsum />, url: '/lorem-ipsum', isEnabled: true },
    { id: 'json-csv', name: 'JSON to CSV', icon: <FileCode size={20} />, component: <JsonToCsv />, url: '/json-csv', isEnabled: true },
    { id: 'csv-json', name: 'CSV to JSON', icon: <FileCode2 size={20} />, component: <CsvToJson />, url: '/csv-json', isEnabled: true },
    { id: 'hash', name: 'Hash Generator', icon: <Dices size={20} />, component: <HashGenerator />, url: '/hash', isEnabled: true },
    { id: 'html-jsx', name: 'HTML to JSX', icon: <Braces2 size={20} />, component: <HtmlToJsx />, url: '/html-jsx', isEnabled: true },
    { id: 'credits', name: 'Credits & Repository', icon: <Info size={20} />, component: <Credits />, url: '/credits', isEnabled: true }
  ];

  return (
    <BrowserRouter>
      <Layout tools={tools} />
    </BrowserRouter>
  );
}

export default App;