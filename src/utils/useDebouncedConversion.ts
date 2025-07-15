import { useEffect, useState } from 'react';

/**
 * Debounced conversion hook for performance optimization.
 * @param value The input value to convert.
 * @param convertFn The conversion function (may throw).
 * @param delay Debounce delay in ms (default: 300).
 * @returns [convertedValue, error]
 */
export function useDebouncedConversion<T, R>(
  value: T,
  convertFn: (v: T) => R,
  delay = 300
): [R | '', string | null] {
  const [result, setResult] = useState<R | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handler = setTimeout(() => {
      try {
        const converted = convertFn(value);
        if (!cancelled) {
          setResult(converted);
          setError(null);
        }
      } catch (e: any) {
        if (!cancelled) {
          setResult('');
          setError(e.message || 'Conversion error');
        }
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, convertFn, delay]);

  return [result, error];
} 