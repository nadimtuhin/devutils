import React from 'react';
import { Github, Star } from 'lucide-react';

export default function Credits() {
  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Credits & Repository</h2>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/nadimtuhin/devutils"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
          >
            <Github size={24} />
            <span className="text-lg font-medium">nadimtuhin/devutils</span>
          </a>
          
          <div className="flex space-x-3">
            <a
              href="https://github.com/nadimtuhin/devutils/stargazers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Star size={16} />
              <span className="text-sm font-medium">Star</span>
            </a>
          </div>
        </div>

        <div className="prose">
          <h3 className="text-lg font-medium mb-2">About</h3>
          <p className="text-gray-600">
            DevUtils is an open-source collection of developer utilities for everyday tasks. Built with React, TypeScript, and Tailwind CSS.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-2">Technologies</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>React with TypeScript</li>
            <li>Tailwind CSS for styling</li>
            <li>Vite for build tooling</li>
            <li>Lucide React for icons</li>
          </ul>

          <h3 className="text-lg font-medium mt-6 mb-2">Contributing</h3>
          <p className="text-gray-600">
            Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.
          </p>
        </div>
      </div>
    </div>
  );
} 