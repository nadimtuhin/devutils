import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface TooltipContent {
  title: string;
  description: string;
  action?: string;
}

interface InteractiveTooltipProps {
  targetSelector: string;
  content: TooltipContent | TooltipContent[];
  isVisible: boolean;
  onClose: () => void;
  position?: "top" | "bottom" | "left" | "right";
  onComplete?: () => void;
}

export default function InteractiveTooltip({
  targetSelector,
  content,
  isVisible,
  onClose,
  position = "bottom",
  onComplete,
}: InteractiveTooltipProps) {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const contents = Array.isArray(content) ? content : [content];
  const currentContent = contents[currentIndex];
  const isMultiStep = contents.length > 1;

  useEffect(() => {
    if (isVisible) {
      const element = document.querySelector(targetSelector);
      if (element) {
        setTargetElement(element);
        element.classList.add("tooltip-highlight");
      }
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove("tooltip-highlight");
      }
    };
  }, [isVisible, targetSelector]);

  useEffect(() => {
    if (targetElement && tooltipRef.current) {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = targetRect.top - tooltipRect.height - 12;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = targetRect.bottom + 12;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 12;
          break;
        case "right":
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 12;
          break;
      }

      // Ensure tooltip stays within viewport
      const padding = 16;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setTooltipPosition({ top, left });
    }
  }, [targetElement, position]);

  const handleNext = () => {
    if (currentIndex < contents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!isVisible || !targetElement) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={onClose} />
      
      {/* Highlight overlay with cutout */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%)`,
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-2xl max-w-sm animate-fade-in"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 pr-2">{currentContent.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-3">{currentContent.description}</p>

          {currentContent.action && (
            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm mb-3">
              💡 {currentContent.action}
            </div>
          )}

          {/* Navigation */}
          {isMultiStep && (
            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className={`flex items-center space-x-1 text-sm ${
                  currentIndex === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>

              <span className="text-xs text-gray-500">
                {currentIndex + 1} / {contents.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <span>{currentIndex === contents.length - 1 ? "Done" : "Next"}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-3 h-3 bg-white transform rotate-45 ${
            position === "top"
              ? "bottom-[-6px] left-1/2 -translate-x-1/2"
              : position === "bottom"
              ? "top-[-6px] left-1/2 -translate-x-1/2"
              : position === "left"
              ? "right-[-6px] top-1/2 -translate-y-1/2"
              : "left-[-6px] top-1/2 -translate-y-1/2"
          }`}
        />
      </div>
    </>
  );
}