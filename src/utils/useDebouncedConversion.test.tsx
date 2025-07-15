import { renderHook, act } from '@testing-library/react-hooks';
import { useDebouncedConversion } from './useDebouncedConversion';

jest.useFakeTimers();

describe('useDebouncedConversion', () => {
  it('returns converted value after debounce', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useDebouncedConversion(value, (v) => v.toUpperCase(), 200),
      { initialProps: { value: 'abc' } }
    );
    expect(result.current[0]).toBe('');
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe('ABC');
    expect(result.current[1]).toBeNull();

    rerender({ value: 'xyz' });
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current[0]).toBe('XYZ');
  });

  it('handles conversion errors', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useDebouncedConversion(value, () => { throw new Error('fail'); }, 100),
      { initialProps: { value: 'err' } }
    );
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[0]).toBe('');
    expect(result.current[1]).toBe('fail');

    rerender({ value: 'ok' });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current[1]).toBe('fail'); // stays until next success
  });

  it('debounces rapid input changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) =>
        useDebouncedConversion(value, (v) => v + '!', 300),
      { initialProps: { value: 'a' } }
    );
    rerender({ value: 'ab' });
    rerender({ value: 'abc' });
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