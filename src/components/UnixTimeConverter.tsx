import React, { useState, useEffect } from 'react';

export default function UnixTimeConverter() {
  const [unixTime, setUnixTime] = useState(Math.floor(Date.now() / 1000));
  const [humanDate, setHumanDate] = useState(new Date().toISOString());

  useEffect(() => {
    const date = new Date(unixTime * 1000);
    setHumanDate(date.toISOString());
  }, [unixTime]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setUnixTime(Math.floor(date.getTime() / 1000));
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Unix Time Converter</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Unix Timestamp</label>
          <input
            type="number"
            value={unixTime}
            onChange={(e) => setUnixTime(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Human Readable Date</label>
          <input
            type="datetime-local"
            value={humanDate.slice(0, 16)}
            onChange={handleDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}