import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS, EVENTS } from 'react-joyride';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOUR_STORAGE_KEY = 'devutils-tour-completed';

const steps: Step[] = [
  {
    target: '[data-tour="sidebar-brand"]',
    content: 'Welcome to DevUtils! This is your collection of handy development tools.',
    placement: 'right',
  },
  {
    target: '[data-tour="search-button"]',
    content: 'Use the search button (⌘K) to quickly find any tool you need.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="shortcuts-button"]',
    content: 'View all keyboard shortcuts to speed up your workflow.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="sidebar-toggle"]',
    content: 'Toggle the sidebar to maximize your workspace when needed.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="tool-list"]',
    content: 'Browse all available tools here. You can drag to reorder them based on your preference!',
    placement: 'right',
  },
  {
    target: '[data-tour="main-content"]',
    content: 'This is where the magic happens - each tool provides instant conversion and formatting capabilities.',
    placement: 'left',
  },
  {
    target: '[data-tour="github-links"]',
    content: 'Don\'t forget to star the repository if you find DevUtils helpful!',
    placement: 'right',
  },
];

export default function GuidedTour({ isOpen, onClose }: GuidedTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRun(true);
    }
  }, [isOpen]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
    }

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Mark tour as completed
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      setRun(false);
      onClose();
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous={true}
      run={run}
      scrollToFirstStep={true}
      showProgress={true}
      showSkipButton={true}
      steps={steps}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          width: 320,
          zIndex: 1000,
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 8,
          fontSize: 14,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: 16,
          fontWeight: 600,
          marginBottom: 8,
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        open: 'Open the dialog',
        skip: 'Skip tour',
      }}
    />
  );
}

// Hook to check if tour should be shown
export function useShouldShowTour() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasCompletedTour) {
      // Show tour after a short delay to ensure UI is rendered
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const markTourCompleted = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setShouldShow(false);
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setShouldShow(true);
  };

  return {
    shouldShow,
    markTourCompleted,
    resetTour,
    setShouldShow,
  };
}