import React from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useOnboarding } from "../contexts/OnboardingContext";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetUrl?: string;
  highlightSelector?: string;
  action?: string;
  waitForAction?: boolean;
  actionType?: 'click' | 'drag' | 'keypress';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    content: "Let's take a quick tour.",
  },
  {
    id: "sidebar",
    title: "Sidebar",
    content: "All tools are in the left sidebar.",
  },
  {
    id: "drag-demo",
    title: "Reorder Tools",
    content: "Drag any tool to reorder (except Credits).",
  },
  {
    id: "search-button",
    title: "Search",
    content: "Click search or press ⌘K/Ctrl+K.",
  },
  {
    id: "shortcuts-button",
    title: "Shortcuts",
    content: "Click keyboard or press ⌘?/Ctrl+?.",
  },
  {
    id: "json-tool",
    title: "JSON Validator",
    content: "Click 'JSON Validator' in sidebar.",
  },
  {
    id: "json-demo",
    title: "Using JSON Validator",
    content: "Paste JSON to validate.",
  },
  {
    id: "base64-tool",
    title: "Base64 Encoder",
    content: "Click 'Base64' in sidebar.",
  },
  {
    id: "tutorial-button",
    title: "Restart Tutorial",
    content: "Use tutorial button in sidebar header.",
  },
  {
    id: "complete",
    title: "Done!",
    content: "Tour complete. Start using DevUtils!",
  },
];

export default function UserJourney() {
  const navigate = useNavigate();
  const { state, nextTourStep, previousTourStep, completeTour, skipTour, restartTour } = useOnboarding();
  
  const isVisible = state.isTourActive;
  const currentStep = state.currentTourStep;
  const currentStepData = tutorialSteps[currentStep];


  const handleNext = () => {
    nextTourStep();
  };

  const handlePrevious = () => {
    previousTourStep();
  };

  const handleSkip = () => {
    skipTour();
  };

  const handleComplete = () => {
    completeTour();
  };

  if (!isVisible) {
    return (
      <>
        {!state.hasCompletedTour && (
          <button
            onClick={restartTour}
            className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Start Tour</span>
            <ChevronRight size={16} />
          </button>
        )}
      </>
    );
  }

  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Tutorial Popup */}
      <div className="fixed bottom-8 right-8 w-96 bg-white rounded-lg shadow-2xl pointer-events-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentStepData.title}
            </h3>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <p className="text-gray-600 mb-4">{currentStepData.content}</p>

          {/* Progress */}
          <div className="flex space-x-1 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md transition-colors ${
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="text-sm text-gray-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>

            {isLastStep ? (
              <button
                onClick={handleComplete}
                className="flex items-center space-x-1 bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={16} />
                <span>Complete</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}