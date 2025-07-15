// Safe Base64 encode/decode utilities with UTF-8 support and error handling

/**
 * Encodes a string to Base64, handling UTF-8 characters.
 * @param input The string to encode.
 * @returns The Base64-encoded string.
 * @throws Error if encoding fails.
 */
export function encodeBase64(input: string): string {
  try {
    // Encode to UTF-8, then to Base64
    return btoa(unescape(encodeURIComponent(input)));
  } catch (e) {
    throw new Error('Failed to encode to Base64.');
  }
}

/**
 * Decodes a Base64 string to UTF-8.
 * @param base64 The Base64 string to decode.
 * @returns The decoded string.
 * @throws Error if decoding fails.
 */
export function decodeBase64(base64: string): string {
  try {
    // Decode from Base64, then from UTF-8
    return decodeURIComponent(escape(atob(base64)));
  } catch (e) {
    throw new Error('Invalid Base64 input.');
  }
} 