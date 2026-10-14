import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

// jsdom does not ship TextEncoder/TextDecoder; browsers do.
Object.assign(globalThis, { TextEncoder, TextDecoder });
