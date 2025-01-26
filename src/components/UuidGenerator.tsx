import React, { useState } from 'react';
import { v4 as uuidv4, v1 as uuidv1, parse as uuidParse, version as uuidVersion } from 'uuid';
import { ulid } from 'ulid';

type UuidInfo = {
  version: number;
  variant: number;
  timestamp?: number;
};

export default function UuidGenerator() {
  const [generatedId, setGeneratedId] = useState('');
  const [idType, setIdType] = useState<'uuidv4' | 'uuidv1' | 'ulid'>('uuidv4');
  const [idInfo, setIdInfo] = useState<UuidInfo | null>(null);

  const generateId = () => {
    let newId = '';
    switch (idType) {
      case 'uuidv4':
        newId = uuidv4();
        break;
      case 'uuidv1':
        newId = uuidv1();
        break;
      case 'ulid':
        newId = ulid();
        break;
    }
    setGeneratedId(newId);
    analyzeId(newId);
  };

  const analyzeId = (id: string) => {
    try {
      if (idType === 'ulid') {
        const timestamp = ulid.decodeTime(id);
        setIdInfo({
          version: 0,
          variant: 0,
          timestamp
        });
      } else {
        const parsed = uuidParse(id);
        setIdInfo({
          version: uuidVersion(parsed),
          variant: parsed[8] >> 6,
          timestamp: idType === 'uuidv1' ? getTimestampFromV1(parsed) : undefined
        });
      }
    } catch (error) {
      setIdInfo(null);
    }
  };

  const getTimestampFromV1 = (parsed: number[]): number => {
    const timeHigh = parsed[6] | (parsed[7] << 8);
    const timeMid = parsed[4] | (parsed[5] << 8);
    const timeLow = parsed[0] | (parsed[1] << 8) | (parsed[2] << 16) | (parsed[3] << 24);
    return (timeHigh * 2 ** 32 + timeLow) / 10000 + 12219292800000;
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">UUID/ULID Generator</h2>
      <div className="space-y-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setIdType('uuidv4')}
            className={`px-4 py-2 rounded-md ${
              idType === 'uuidv4'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            UUID v4
          </button>
          <button
            onClick={() => setIdType('uuidv1')}
            className={`px-4 py-2 rounded-md ${
              idType === 'uuidv1'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            UUID v1
          </button>
          <button
            onClick={() => setIdType('ulid')}
            className={`px-4 py-2 rounded-md ${
              idType === 'ulid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ULID
          </button>
        </div>
        <button
          onClick={generateId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate
        </button>
        {generatedId && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Generated ID</label>
              <div className="flex">
                <input
                  type="text"
                  value={generatedId}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 font-mono"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedId)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                >
                  Copy
                </button>
              </div>
            </div>
            {idInfo && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">ID Information</h3>
                <div className="bg-gray-50 rounded-md p-4 space-y-2">
                  {idType !== 'ulid' && (
                    <>
                      <p>Version: {idInfo.version}</p>
                      <p>Variant: {idInfo.variant}</p>
                    </>
                  )}
                  {idInfo.timestamp && (
                    <p>Timestamp: {new Date(idInfo.timestamp).toISOString()}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}