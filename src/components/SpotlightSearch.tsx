import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  icon: React.ReactNode;
  url: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
}

const SpotlightSearch: React.FC<Props> = ({ isOpen, onClose, tools }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleToolSelect = (tool: Tool) => {
    navigate(tool.url);
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(i => Math.min(i + 1, filteredTools.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(i => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTools[selectedIndex]) {
            handleToolSelect(filteredTools[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, onClose, handleToolSelect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[20vh] z-50">
      <div className="bg-white rounded-lg w-[600px] shadow-2xl">
        <div className="p-4 flex items-center border-b">
          <Search size={20} className="text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools..."
            className="flex-1 outline-none text-lg dark:text-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {filteredTools.map((tool, index) => (
            <button
              key={tool.id}
              className={`w-full px-4 py-2 flex items-center space-x-3 hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleToolSelect(tool)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-gray-600 dark:text-gray-400">{tool.icon}</span>
              <span className="dark:text-white">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpotlightSearch; 