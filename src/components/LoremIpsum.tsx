import React, { useState } from 'react';

const words = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'
];

export default function LoremIpsum() {
  const [paragraphs, setParagraphs] = useState(1);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [output, setOutput] = useState('');

  const generateText = () => {
    const result = [];
    for (let i = 0; i < paragraphs; i++) {
      const paragraph = [];
      for (let j = 0; j < wordsPerParagraph; j++) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        paragraph.push(j === 0 ? randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord);
      }
      result.push(paragraph.join(' ') + '.');
    }
    setOutput(result.join('\n\n'));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Lorem Ipsum Generator</h2>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Number of Paragraphs
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={paragraphs}
              onChange={(e) => setParagraphs(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Words per Paragraph
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={wordsPerParagraph}
              onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={generateText}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate
        </button>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Generated Text</label>
          <textarea
            value={output}
            readOnly
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          />
        </div>
      </div>
    </div>
  );
}