import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Open Spotlight Search</span>
              <div className="flex space-x-2">
                <kbd className="px-2 py-1 bg-gray-100 rounded">⌘ K</kbd>
                <span className="text-gray-400">or</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl ⇧ P</kbd>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Show Keyboard Shortcuts</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">⌘ ?</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Show Guided Tour</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">⌘ ⇧ ?</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Navigate Tools</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">↑/↓</kbd>
            </div>
            <div className="flex justify-between items-center">
              <span>Select Tool</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts; 