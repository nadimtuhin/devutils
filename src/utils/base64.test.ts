import { encodeBase64, decodeBase64, decodeBase64Url } from './base64';

describe('Base64 Utilities', () => {
  it('encodes ASCII text correctly', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('decodes ASCII Base64 correctly', () => {
    expect(decodeBase64('aGVsbG8=')).toBe('hello');
  });

  it('encodes UTF-8 text correctly', () => {
    expect(encodeBase64('✓ à la mode')).toBe('4pyTIMOgIGxhIG1vZGU=');
  });

  it('decodes UTF-8 Base64 correctly', () => {
    expect(decodeBase64('4pyTIMOgIGxhIG1vZGU=')).toBe('✓ à la mode');
  });

  it('throws on invalid Base64 input', () => {
    expect(() => decodeBase64('!@#$')).toThrow('Invalid Base64 input.');
  });

  it('round-trips random UTF-8 strings', () => {
    const samples = ['こんにちは', '😀😃😄😁', '¡Hola, señor!', 'Привет мир', 'مرحبا بالعالم'];
    for (const s of samples) {
      expect(decodeBase64(encodeBase64(s))).toBe(s);
    }
  });
});

describe('decodeBase64Url', () => {
  it('decodes the URL-safe alphabet without padding', () => {
    expect(decodeBase64Url('eyJxIjoiPz8_In0')).toBe('{"q":"???"}');
  });

  it('decodes UTF-8 text', () => {
    expect(decodeBase64Url('eyJuYW1lIjoiSm9zw6kifQ')).toBe('{"name":"José"}');
  });

  it('throws on invalid input', () => {
    expect(() => decodeBase64Url('!@#$')).toThrow('Invalid Base64 input.');
  });
}); 