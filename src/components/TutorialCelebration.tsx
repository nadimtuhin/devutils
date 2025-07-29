import React from "react";
import { CheckCircle } from "lucide-react";

interface TutorialCelebrationProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TutorialCelebration({ isVisible, onClose }: TutorialCelebrationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tutorial Complete!
          </h2>
          <p className="text-gray-600 mb-4">
            You're ready to use DevUtils.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}