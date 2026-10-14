import { readStoredArray } from './readStoredArray';

describe('readStoredArray', () => {
  beforeEach(() => localStorage.clear());

  it('returns an empty array when the key is missing', () => {
    expect(readStoredArray('k')).toEqual([]);
  });

  it('returns the stored array', () => {
    localStorage.setItem('k', '["a","b"]');
    expect(readStoredArray('k')).toEqual(['a', 'b']);
  });

  it('falls back to an empty array on corrupt JSON', () => {
    localStorage.setItem('k', '{not json');
    expect(readStoredArray('k')).toEqual([]);
  });

  it('falls back to an empty array when the value is not an array', () => {
    localStorage.setItem('k', '{"a":1}');
    expect(readStoredArray('k')).toEqual([]);
  });
});
