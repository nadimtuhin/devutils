import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight,
  Code2,
  Palette,
  Lock,
  Rocket
} from "lucide-react";
import { useOnboarding } from "../contexts/OnboardingContext";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const navigate = useNavigate();
  const { hideWelcome } = useOnboarding();

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast",
      description: "Runs locally"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure",
      description: "No data sent"
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Developer Tools",
      description: "Built for devs"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Modern UI",
      description: "Clean interface"
    }
  ];

  const popularTools = [
    { name: "JSON Validator", url: "/json-validator" },
    { name: "Base64 Encoder", url: "/base64" },
    { name: "JWT Debugger", url: "/jwt" },
    { name: "Unix Time Converter", url: "/unix-time" },
  ];

  const handleQuickStart = (url: string) => {
    hideWelcome();
    navigate(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">DevUtils</h1>
          <p className="text-xl opacity-90">Developer Tools</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Start */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Rocket className="w-5 h-5 mr-2 text-blue-600" />
              Quick Start
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {popularTools.map((tool) => (
                <button
                  key={tool.url}
                  onClick={() => handleQuickStart(tool.url)}
                  className="text-left px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <span className="text-gray-700 hover:text-blue-600">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Privacy</h4>
                <p className="text-sm text-green-700 mt-1">
                  Tools run locally. No data sent to servers.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onGetStarted}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <span>Take the Tour</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                hideWelcome();
                navigate("/unix-time");
              }}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Skip to Tools
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}