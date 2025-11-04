import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link as RouterLink,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Clock,
  Code2,
  FileJson,
  FileCode,
  Image,
  Key,
  Search,
  Link as LinkIcon,
  Code,
  Braces,
  Hash,
  FileText,
  Diff,
  FileSpreadsheet,
  Text,
  RotateCw,
  FileCode2,
  Dices,
  Braces as Braces2,
  FileDown,
  Database,
  Type,
  Timer,
  Palette,
  ArrowLeftRight,
  Binary,
  FileImage,
  Terminal,
  Code as Code3,
  Shield,
  Sigma,
  ListFilter,
  FileType,
  Keyboard,
  Github,
  Star,
  Info,
  PanelLeftClose,
  PanelLeft,
  GripVertical,
  PlayCircle,
} from "lucide-react";
import UnixTimeConverter from "./components/UnixTimeConverter";
import JsonValidator from "./components/JsonValidator";
import { Base64SideBySide } from "./components/Base64SideBySide";
import Base64ImageEncoder from "./components/Base64ImageEncoder";
import JwtDebugger from "./components/JwtDebugger";
import RegexpTester from "./components/RegexpTester";
import UrlEncoder from "./components/UrlEncoder";
import UrlParser from "./components/UrlParser";
import HtmlEntityConverter from "./components/HtmlEntityConverter";
import BackslashEncoder from "./components/BackslashEncoder";
import UuidGenerator from "./components/UuidGenerator";
import HtmlPreview from "./components/HtmlPreview";
import TextDiff from "./components/TextDiff";
import YamlToJson from "./components/YamlToJson";
import YamlFormatter from "./components/YamlFormatter";
import MakefileValidator from "./components/MakefileValidator";
import NumberBaseConverter from "./components/NumberBaseConverter";
import LoremIpsum from "./components/LoremIpsum";
import JsonToCsv from "./components/JsonToCsv";
import CsvToJson from "./components/CsvToJson";
import HashGenerator from "./components/HashGenerator";
import HtmlToJsx from "./components/HtmlToJsx";
import MarkdownPreview from "./components/MarkdownPreview";
import SqlFormatter from "./components/SqlFormatter";
import StringCaseConverter from "./components/StringCaseConverter";
import CronJobParser from "./components/CronJobParser";
import ColorConverter from "./components/ColorConverter";
import PhpJsonConverter from "./components/PhpJsonConverter";
import PhpSerializer from "./components/PhpSerializer";
import SvgToCss from "./components/SvgToCss";
import CurlToCode from "./components/CurlToCode";
import JsonToCode from "./components/JsonToCode";
import CertificateDecoder from "./components/CertificateDecoder";
import CertificateGenerator from "./components/CertificateGenerator";
import HexAsciiConverter from "./components/HexAsciiConverter";
import LineSorter from "./components/LineSorter";
import CssMinifyBeautify from "./components/CssMinifyBeautify";
import JavaScriptMinifyBeautify from "./components/JavaScriptMinifyBeautify";
import HtmlMinifyBeautify from "./components/HtmlMinifyBeautify";
import SpotlightSearch from "./components/SpotlightSearch";
import KeyboardShortcuts from "./components/KeyboardShortcuts";
import Credits from "./components/Credits";
import WelcomeScreen from "./components/WelcomeScreen";
import UserJourney from "./components/UserJourney";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Tool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  url: string;
  isEnabled: boolean;
};

function SortableToolItem({
  tool,
  currentPath,
  isSidebarExpanded,
  isDragActive,
}: {
  tool: Tool;
  currentPath: string;
  isSidebarExpanded: boolean;
  isDragActive: boolean;
}) {
  const isCredits = tool.id === "credits";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id, disabled: isCredits });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if currently dragging
    if (isDragActive || isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(!isCredits ? attributes : {})}
      {...(!isCredits ? listeners : {})}
      className={`group mb-1 relative ${!isCredits ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "z-50" : ""}`}
    >
      <RouterLink
        to={tool.url}
        onClick={handleClick}
        className={`w-full flex items-center ${isSidebarExpanded ? "space-x-3 px-4" : "justify-center px-2"} py-3 rounded-lg transition-colors ${
          currentPath === tool.url
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-gray-50"
        } no-underline`}
        title={!isSidebarExpanded ? tool.name : undefined}
      >
        {isSidebarExpanded && !isCredits && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical size={16} className="text-gray-400" />
          </div>
        )}
        <div className={isSidebarExpanded && !isCredits ? "ml-5" : ""}>{tool.icon}</div>
        {isSidebarExpanded && (
          <span className="text-sm font-medium">{tool.name}</span>
        )}
      </RouterLink>
    </div>
  );
}

function Layout({ tools: defaultTools }: { tools: Tool[] }) {
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDragActive, setIsDragActive] = useState(false);
  const { state, startTour, hideWelcome, notifyDragComplete } = useOnboarding();
  const [tools, setTools] = useState<Tool[]>(() => {
    const savedOrder = localStorage.getItem("toolsOrder");
    if (savedOrder) {
      const orderIds = JSON.parse(savedOrder);
      // Reconstruct tools array based on saved order
      const orderedTools = orderIds
        .map((id: string) => defaultTools.find((tool) => tool.id === id))
        .filter(Boolean);

      // Add any new tools that weren't in the saved order
      const newTools = defaultTools.filter(
        (tool) => !orderIds.includes(tool.id)
      );

      const allTools = [...orderedTools, ...newTools];
      
      // Ensure credits is always at the end
      const creditsIndex = allTools.findIndex((tool) => tool.id === "credits");
      if (creditsIndex !== -1 && creditsIndex !== allTools.length - 1) {
        const creditsItem = allTools[creditsIndex];
        const toolsWithoutCredits = allTools.filter((tool) => tool.id !== "credits");
        return [...toolsWithoutCredits, creditsItem];
      }
      
      return allTools;
    }
    
    // Ensure credits is at the end for initial load
    const creditsIndex = defaultTools.findIndex((tool) => tool.id === "credits");
    if (creditsIndex !== -1 && creditsIndex !== defaultTools.length - 1) {
      const creditsItem = defaultTools[creditsIndex];
      const toolsWithoutCredits = defaultTools.filter((tool) => tool.id !== "credits");
      return [...toolsWithoutCredits, creditsItem];
    }
    
    return defaultTools;
  });

  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Control + K for spotlight
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsShortcutsOpen(false);
        setIsSpotlightOpen(true);
      }
      // Control + Shift + P for spotlight
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setIsShortcutsOpen(false);
        setIsSpotlightOpen(true);
      }
      // Command/Control + ? for shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "?") {
        e.preventDefault();
        setIsSpotlightOpen(false);
        setIsShortcutsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close modals when tutorial step changes
  useEffect(() => {
    if (state.isTourActive) {
      setIsSpotlightOpen(false);
      setIsShortcutsOpen(false);
    }
  }, [state.currentTourStep, state.isTourActive]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = () => {
    setIsDragActive(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Set a timeout to reset drag state to allow click events to be properly handled
    setTimeout(() => {
      setIsDragActive(false);
    }, 100);

    // Notify tutorial system that a drag completed
    if (over && active.id !== over.id) {
      notifyDragComplete();
    }

    if (over && active.id !== over.id) {
      const enabledTools = tools.filter((tool) => tool.isEnabled);
      
      // Exclude credits from reordering - it should always remain last
      const enabledToolsWithoutCredits = enabledTools.filter((tool) => tool.id !== "credits");
      const creditsItem = enabledTools.find((tool) => tool.id === "credits");
      
      const oldIndex = enabledToolsWithoutCredits.findIndex((tool) => tool.id === active.id);
      const newIndex = enabledToolsWithoutCredits.findIndex((tool) => tool.id === over.id);

      const reorderedTools = arrayMove(enabledToolsWithoutCredits, oldIndex, newIndex);
      
      // Add credits back at the end if it exists
      const reorderedEnabledTools = creditsItem ? [...reorderedTools, creditsItem] : reorderedTools;

      // Reconstruct the full tools array with disabled tools in their original positions
      const newTools = tools.map((tool) => {
        if (!tool.isEnabled) return tool;
        return reorderedEnabledTools.find((t) => t.id === tool.id) || tool;
      });

      // Replace enabled tools section with reordered tools
      const disabledTools = newTools.filter((tool) => !tool.isEnabled);
      const finalTools = [...reorderedEnabledTools, ...disabledTools];

      setTools(finalTools);

      // Save the new order to localStorage
      const orderIds = finalTools.map((tool) => tool.id);
      localStorage.setItem("toolsOrder", JSON.stringify(orderIds));
    }
  };

  const handleStartTour = () => {
    console.log('Start tutorial button clicked');
    console.log('Current tour state:', state);
    startTour();
  };

  const handleSkipWelcome = () => {
    hideWelcome();
  };

  if (!state.hasSeenWelcome) {
    return <WelcomeScreen onGetStarted={handleStartTour} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${isSidebarExpanded ? "w-64" : "w-16"} bg-white shadow-lg overflow-y-auto flex flex-col transition-all duration-200 ease-in-out sidebar`}
      >
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-3">
            {isSidebarExpanded ? (
              <RouterLink
                to="/"
                className="text-xl font-bold text-gray-800 no-underline"
              >
                DevUtils
              </RouterLink>
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
                    onClick={() => {
                      setIsShortcutsOpen(false);
                      setIsSpotlightOpen(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Search (⌘K)"
                  >
                    <Search size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setIsSpotlightOpen(false);
                      setIsShortcutsOpen(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Keyboard Shortcuts (⌘?)"
                  >
                    <Keyboard size={18} />
                  </button>
                  <button
                    onClick={handleStartTour}
                    className="p-1.5 hover:bg-gray-100 rounded"
                    title="Start Tutorial"
                  >
                    <PlayCircle size={18} />
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tools
                .filter((tool) => tool.isEnabled)
                .map((tool) => tool.id)}
              strategy={verticalListSortingStrategy}
            >
              {tools
                .filter((tool) => tool.isEnabled)
                .map((tool) => (
                  <SortableToolItem
                    key={tool.id}
                    tool={tool}
                    currentPath={currentPath}
                    isSidebarExpanded={isSidebarExpanded}
                    isDragActive={isDragActive}
                  />
                ))}
            </SortableContext>
          </DndContext>
        </nav>
        {isSidebarExpanded && (
          <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex items-center justify-center">
              Last updated: Jul 23, 2025
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/unix-time" replace />} />
            {tools.map((tool) => (
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

      {/* User Journey Tutorial */}
      <UserJourney />
    </div>
  );
}

function AppContent() {
  const tools: Tool[] = [
    {
      id: "cron-parser",
      name: "Cron Job Parser",
      icon: <Timer size={20} />,
      component: <CronJobParser />,
      url: "/cron-parser",
      isEnabled: true,
    },
    {
      id: "yaml-json",
      name: "YAML to JSON",
      icon: <FileSpreadsheet size={20} />,
      component: <YamlToJson />,
      url: "/yaml-json",
      isEnabled: true,
    },
    {
      id: "yaml-formatter",
      name: "YAML Formatter & Validator",
      icon: <FileCode size={20} />,
      component: <YamlFormatter />,
      url: "/yaml-formatter",
      isEnabled: true,
    },
    {
      id: "makefile-validator",
      name: "Makefile Validator",
      icon: <FileText size={20} />,
      component: <MakefileValidator />,
      url: "/makefile-validator",
      isEnabled: true,
    },
    {
      id: "json-validator",
      name: "JSON Validator",
      icon: <FileJson size={20} />,
      component: <JsonValidator />,
      url: "/json-validator",
      isEnabled: true,
    },
    {
      id: "sql-formatter",
      name: "SQL Formatter",
      icon: <Database size={20} />,
      component: <SqlFormatter />,
      url: "/sql-formatter",
      isEnabled: true,
    },
    {
      id: "php-serializer",
      name: "PHP Serializer",
      icon: <Binary size={20} />,
      component: <PhpSerializer />,
      url: "/php-serializer",
      isEnabled: true,
    },
    {
      id: "php-json",
      name: "PHP ↔ JSON",
      icon: <ArrowLeftRight size={20} />,
      component: <PhpJsonConverter />,
      url: "/php-json",
      isEnabled: true,
    },
    {
      id: "curl-code",
      name: "cURL to Code",
      icon: <Terminal size={20} />,
      component: <CurlToCode />,
      url: "/curl-code",
      isEnabled: true,
    },
    {
      id: "csv-json",
      name: "CSV to JSON",
      icon: <FileCode2 size={20} />,
      component: <CsvToJson />,
      url: "/csv-json",
      isEnabled: true,
    },
    {
      id: "json-csv",
      name: "JSON to CSV",
      icon: <FileCode size={20} />,
      component: <JsonToCsv />,
      url: "/json-csv",
      isEnabled: true,
    },
    {
      id: "json-code",
      name: "JSON to Code",
      icon: <Code3 size={20} />,
      component: <JsonToCode />,
      url: "/json-code",
      isEnabled: true,
    },
    {
      id: "base64",
      name: "Base64 Encoder/Decoder",
      icon: <Code2 size={20} />,
      component: <Base64SideBySide />,
      url: "/base64",
      isEnabled: true,
    },
    {
      id: "text-diff",
      name: "Text Diff Checker",
      icon: <Diff size={20} />,
      component: <TextDiff />,
      url: "/text-diff",
      isEnabled: true,
    },
    {
      id: "line-sorter",
      name: "Line Sort/Dedupe",
      icon: <ListFilter size={20} />,
      component: <LineSorter />,
      url: "/line-sorter",
      isEnabled: true,
    },
    {
      id: "cert-decoder",
      name: "Certificate Decoder",
      icon: <Shield size={20} />,
      component: <CertificateDecoder />,
      url: "/cert-decoder",
      isEnabled: true,
    },
    {
      id: "cert-generator",
      name: "Certificate Generator",
      icon: <Key size={20} />,
      component: <CertificateGenerator />,
      url: "/cert-generator",
      isEnabled: true,
    },
    {
      id: "svg-css",
      name: "SVG to CSS",
      icon: <FileImage size={20} />,
      component: <SvgToCss />,
      url: "/svg-css",
      isEnabled: true,
    },
    {
      id: "hex-ascii",
      name: "Hex ↔ ASCII",
      icon: <Sigma size={20} />,
      component: <HexAsciiConverter />,
      url: "/hex-ascii",
      isEnabled: true,
    },
    {
      id: "string-case",
      name: "String Case Converter",
      icon: <Type size={20} />,
      component: <StringCaseConverter />,
      url: "/string-case",
      isEnabled: true,
    },
    {
      id: "unix-time",
      name: "Unix Time Converter",
      icon: <Clock size={20} />,
      component: <UnixTimeConverter />,
      url: "/unix-time",
      isEnabled: true,
    },
    {
      id: "base64-image",
      name: "Base64 Image Encoder",
      icon: <Image size={20} />,
      component: <Base64ImageEncoder />,
      url: "/base64-image",
      isEnabled: true,
    },
    {
      id: "jwt",
      name: "JWT Debugger",
      icon: <Key size={20} />,
      component: <JwtDebugger />,
      url: "/jwt",
      isEnabled: true,
    },
    {
      id: "regexp",
      name: "RegExp Tester",
      icon: <Search size={20} />,
      component: <RegexpTester />,
      url: "/regexp",
      isEnabled: true,
    },
    {
      id: "url-encoder",
      name: "URL Encoder/Decoder",
      icon: <LinkIcon size={20} />,
      component: <UrlEncoder />,
      url: "/url-encoder",
      isEnabled: true,
    },
    {
      id: "url-parser",
      name: "URL Parser",
      icon: <LinkIcon size={20} />,
      component: <UrlParser />,
      url: "/url-parser",
      isEnabled: true,
    },
    {
      id: "html-entity",
      name: "HTML Entity Converter",
      icon: <Code size={20} />,
      component: <HtmlEntityConverter />,
      url: "/html-entity",
      isEnabled: true,
    },
    {
      id: "backslash",
      name: "Backslash Encoder",
      icon: <Braces size={20} />,
      component: <BackslashEncoder />,
      url: "/backslash",
      isEnabled: true,
    },
    {
      id: "uuid",
      name: "UUID/ULID Generator",
      icon: <Hash size={20} />,
      component: <UuidGenerator />,
      url: "/uuid",
      isEnabled: true,
    },
    {
      id: "html-preview",
      name: "HTML Preview",
      icon: <FileText size={20} />,
      component: <HtmlPreview />,
      url: "/html-preview",
      isEnabled: true,
    },
    {
      id: "number-base",
      name: "Number Base Converter",
      icon: <Text size={20} />,
      component: <NumberBaseConverter />,
      url: "/number-base",
      isEnabled: true,
    },
    {
      id: "lorem-ipsum",
      name: "Lorem Ipsum Generator",
      icon: <RotateCw size={20} />,
      component: <LoremIpsum />,
      url: "/lorem-ipsum",
      isEnabled: true,
    },
    {
      id: "hash",
      name: "Hash Generator",
      icon: <Dices size={20} />,
      component: <HashGenerator />,
      url: "/hash",
      isEnabled: true,
    },
    {
      id: "html-jsx",
      name: "HTML to JSX",
      icon: <Braces2 size={20} />,
      component: <HtmlToJsx />,
      url: "/html-jsx",
      isEnabled: true,
    },
    {
      id: "css-minify-beautify",
      name: "CSS Minify/Beautify",
      icon: <FileType size={20} />,
      component: <CssMinifyBeautify />,
      url: "/css-minify-beautify",
      isEnabled: false,
    },
    {
      id: "js-minify-beautify",
      name: "JavaScript Minify/Beautify",
      icon: <Code3 size={20} />,
      component: <JavaScriptMinifyBeautify />,
      url: "/js-minify-beautify",
      isEnabled: false,
    },
    {
      id: "html-minify-beautify",
      name: "HTML Minify/Beautify",
      icon: <FileText size={20} />,
      component: <HtmlMinifyBeautify />,
      url: "/html-minify-beautify",
      isEnabled: false,
    },
    {
      id: "markdown-preview",
      name: "Markdown Preview",
      icon: <FileDown size={20} />,
      component: <MarkdownPreview />,
      url: "/markdown-preview",
      isEnabled: false,
    },
    {
      id: "color-converter",
      name: "Color Converter",
      icon: <Palette size={20} />,
      component: <ColorConverter />,
      url: "/color-converter",
      isEnabled: false,
    },
    {
      id: "credits",
      name: "Credits & Repository",
      icon: <Info size={20} />,
      component: <Credits />,
      url: "/credits",
      isEnabled: true,
    },
  ];

  return (
    <BrowserRouter>
      <Layout tools={tools} />
    </BrowserRouter>
  );
}

function App() {
  return (
    <OnboardingProvider>
      <AppContent />
    </OnboardingProvider>
  );
}

export default App;
