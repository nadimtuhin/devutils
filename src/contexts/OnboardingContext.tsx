import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface OnboardingState {
  hasSeenWelcome: boolean;
  hasCompletedTour: boolean;
  currentTourStep: number;
  isTourActive: boolean;
  tourProgress: string[];
}

interface OnboardingContextType {
  state: OnboardingState;
  showWelcome: () => void;
  hideWelcome: () => void;
  startTour: () => void;
  nextTourStep: () => void;
  previousTourStep: () => void;
  completeTour: () => void;
  skipTour: () => void;
  restartTour: () => void;
  markFeatureDiscovered: (feature: string) => void;
  isFeatureDiscovered: (feature: string) => boolean;
  notifyDragComplete: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WELCOME_SEEN: "devutils_welcome_seen",
  TOUR_COMPLETED: "devutils_tour_completed",
  TOUR_SKIPPED: "devutils_tour_skipped",
  FEATURE_DISCOVERIES: "devutils_feature_discoveries",
  TOUR_PROGRESS: "devutils_tour_progress",
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>(() => {
    const hasSeenWelcome = !!localStorage.getItem(STORAGE_KEYS.WELCOME_SEEN);
    const hasCompletedTour = !!localStorage.getItem(STORAGE_KEYS.TOUR_COMPLETED);
    const tourProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOUR_PROGRESS) || "[]");

    return {
      hasSeenWelcome,
      hasCompletedTour,
      currentTourStep: 0,
      isTourActive: false,
      tourProgress,
    };
  });

  const showWelcome = () => {
    setState(prev => ({ ...prev, hasSeenWelcome: false }));
    localStorage.removeItem(STORAGE_KEYS.WELCOME_SEEN);
  };

  const hideWelcome = () => {
    setState(prev => ({ ...prev, hasSeenWelcome: true }));
    localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, "true");
  };

  const startTour = () => {
    console.log('startTour called');
    setState(prev => ({
      ...prev,
      isTourActive: true,
      currentTourStep: 0,
      hasSeenWelcome: true,
    }));
    localStorage.setItem(STORAGE_KEYS.WELCOME_SEEN, "true");
    localStorage.removeItem(STORAGE_KEYS.TOUR_SKIPPED);
    console.log('startTour completed');
  };

  const nextTourStep = () => {
    setState(prev => ({ ...prev, currentTourStep: prev.currentTourStep + 1 }));
  };

  const previousTourStep = () => {
    setState(prev => ({ 
      ...prev, 
      currentTourStep: Math.max(0, prev.currentTourStep - 1) 
    }));
  };

  const completeTour = () => {
    setState(prev => ({
      ...prev,
      hasCompletedTour: true,
      isTourActive: false,
      currentTourStep: 0,
    }));
    localStorage.setItem(STORAGE_KEYS.TOUR_COMPLETED, "true");
    localStorage.removeItem(STORAGE_KEYS.TOUR_SKIPPED);
  };

  const skipTour = () => {
    setState(prev => ({
      ...prev,
      isTourActive: false,
      currentTourStep: 0,
    }));
    localStorage.setItem(STORAGE_KEYS.TOUR_SKIPPED, "true");
  };

  const restartTour = () => {
    setState(prev => ({
      ...prev,
      hasCompletedTour: false,
      isTourActive: true,
      currentTourStep: 0,
    }));
    localStorage.removeItem(STORAGE_KEYS.TOUR_COMPLETED);
    localStorage.removeItem(STORAGE_KEYS.TOUR_SKIPPED);
  };

  const markFeatureDiscovered = (feature: string) => {
    const discoveries = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURE_DISCOVERIES) || "[]");
    if (!discoveries.includes(feature)) {
      discoveries.push(feature);
      localStorage.setItem(STORAGE_KEYS.FEATURE_DISCOVERIES, JSON.stringify(discoveries));
    }
  };

  const isFeatureDiscovered = (feature: string): boolean => {
    const discoveries = JSON.parse(localStorage.getItem(STORAGE_KEYS.FEATURE_DISCOVERIES) || "[]");
    return discoveries.includes(feature);
  };

  const notifyDragComplete = () => {
    // This will be called from the Layout component when a drag ends
    const dragCompleteEvent = new CustomEvent('tutorial-drag-complete');
    window.dispatchEvent(dragCompleteEvent);
  };

  const contextValue: OnboardingContextType = {
    state,
    showWelcome,
    hideWelcome,
    startTour,
    nextTourStep,
    previousTourStep,
    completeTour,
    skipTour,
    restartTour,
    markFeatureDiscovered,
    isFeatureDiscovered,
    notifyDragComplete,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

export default OnboardingContext;