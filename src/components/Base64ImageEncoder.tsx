import React, { useState } from 'react';

export default function Base64ImageEncoder() {
  const [imageBase64, setImageBase64] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setError('');
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold dark:text-white mb-6">Base64 Image Encoder</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 transition-colors"
          />
          {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
        </div>
        
        {imageBase64 && (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
              <img
                src={imageBase64}
                alt="Preview"
                className="max-w-full h-auto border border-gray-300 dark:border-gray-600 rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base64 Output</label>
              <textarea
                value={imageBase64}
                readOnly
                className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 font-mono text-sm text-gray-900 dark:text-gray-100"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}