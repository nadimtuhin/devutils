import React, { useState, useEffect } from 'react';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import a11yPlugin from 'colord/plugins/a11y';

// Extend colord with plugins
extend([namesPlugin, a11yPlugin]);

const ColorConverter = () => {
  const [color, setColor] = useState('#1e90ff');
  const [error, setError] = useState('');

  const updateColor = (value: string) => {
    try {
      const c = colord(value);
      if (c.isValid()) {
        setColor(value);
        setError('');
      } else {
        setError('Invalid color format');
      }
    } catch {
      setError('Invalid color format');
    }
  };

  const c = colord(color);
  const formats = {
    hex: c.toHex(),
    rgb: c.toRgbString(),
    hsl: c.toHslString(),
    hwb: c.toHwbString(),
    name: c.toName() || 'No CSS color name',
    cmyk: `cmyk(${c.toCmyk().c}%, ${c.toCmyk().m}%, ${c.toCmyk().y}%, ${c.toCmyk().k}%)`,
  };

  const contrast = {
    white: c.contrast('#ffffff').toFixed(2),
    black: c.contrast('#000000').toFixed(2),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Color Converter</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Input
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => updateColor(e.target.value)}
              className="w-full p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter color (e.g. #1e90ff, rgb(255,0,0), blue)"
            />
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Color Preview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="h-24 rounded-lg border"
                style={{ backgroundColor: c.isValid() ? color : '#ffffff' }}
              />
              <div className="space-y-2">
                <div>
                  <div className="text-sm font-medium">Contrast ratio</div>
                  <div className="text-sm">
                    vs White: {contrast.white}
                    <br />
                    vs Black: {contrast.black}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">WCAG 2.1</div>
                  <div className="text-sm">
                    AA Text: {c.isReadable('#ffffff') ? '✅' : '❌'}
                    <br />
                    AAA Text: {c.isReadable('#ffffff', { level: 'AAA' }) ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(formats).map(([format, value]) => (
            <div key={format} className="p-4 border rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {format.toUpperCase()}
              </label>
              <input
                type="text"
                readOnly
                value={value}
                className="w-full p-2 font-mono text-sm border rounded bg-gray-50"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorConverter; 