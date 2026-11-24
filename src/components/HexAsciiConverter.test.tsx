import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HexAsciiConverter from './HexAsciiConverter';

const convert = (input: string) => {
  const [inputEditor, outputEditor] = screen.getAllByTestId('code-editor');
  fireEvent.change(inputEditor, { target: { value: input } });
  fireEvent.click(screen.getByRole('button', { name: 'Convert' }));
  return outputEditor;
};

describe('HexAsciiConverter', () => {
  it('decodes space-separated hex, the format it produces itself', () => {
    render(<HexAsciiConverter />);
    expect(convert('48 69')).toHaveValue('Hi');
  });

  it('ignores newlines and tabs between hex bytes', () => {
    render(<HexAsciiConverter />);
    expect(convert('48\n65\t6C 6C\r\n6F')).toHaveValue('Hello');
  });

  it('still rejects non-hex characters', () => {
    render(<HexAsciiConverter />);
    expect(convert('48 ZZ')).toHaveValue('Error: Invalid hex string');
  });

  it('encodes ASCII to space-separated hex', () => {
    render(<HexAsciiConverter />);
    fireEvent.click(screen.getByRole('button', { name: 'ASCII to Hex' }));
    expect(convert('Hi')).toHaveValue('48 69');
  });
});
