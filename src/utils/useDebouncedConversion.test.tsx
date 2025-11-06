import { renderHook, act } from '@testing-library/react';
import { useDebouncedConversion } from './useDebouncedConversion';

jest.useFakeTimers();

describe('useDebouncedConversion', () => {
  it('returns converted value after debounce', () => {
    let value = 'abc';
    const { result, rerender } = renderHook(
      () => useDebouncedConversion(value, (v) => v.toUpperCase(), 200)
    );
    expect(result.current[0]).toBe('');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe('ABC');
    expect(result.current[1]).toBeNull();

    value = 'xyz';
    rerender();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe('XYZ');
  });

  it('handles conversion errors', () => {
    let value = 'err';
    const { result, rerender } = renderHook(
      () => useDebouncedConversion(value, () => { throw new Error('fail'); }, 100)
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('');
    expect(result.current[1]).toBe('fail');

    value = 'ok';
    rerender();
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[1]).toBe('fail'); // stays until next success
  });

  it('debounces rapid input changes', () => {
    let value = 'a';
    const { result, rerender } = renderHook(
      () => useDebouncedConversion(value, (v) => v + '!', 300)
    );
    value = 'ab';
    rerender();
    value = 'abc';
    rerender();
    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current[0]).toBe('');
    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current[0]).toBe('abc!');
  });
}); 