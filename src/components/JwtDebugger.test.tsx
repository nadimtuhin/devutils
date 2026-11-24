import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JwtDebugger from './JwtDebugger';

const HEADER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'; // {"alg":"HS256","typ":"JWT"}

const decode = (token: string) => {
  fireEvent.change(screen.getByPlaceholderText('Paste your JWT token here...'), {
    target: { value: token },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Decode' }));
};

describe('JwtDebugger', () => {
  it('decodes a payload that uses the base64url alphabet', () => {
    render(<JwtDebugger />);
    decode(`${HEADER}.eyJxIjoiPz8_In0.sig`); // {"q":"???"}
    expect(screen.queryByText('Invalid JWT token')).not.toBeInTheDocument();
    expect(screen.getByText(/"q": "\?\?\?"/)).toBeInTheDocument();
  });

  it('decodes UTF-8 claims', () => {
    render(<JwtDebugger />);
    decode(`${HEADER}.eyJuYW1lIjoiSm9zw6kifQ.sig`); // {"name":"José"}
    expect(screen.getByText(/"name": "José"/)).toBeInTheDocument();
  });

  it('rejects a token without three parts', () => {
    render(<JwtDebugger />);
    decode('not-a-jwt');
    expect(screen.getByText('Invalid JWT token')).toBeInTheDocument();
  });
});
