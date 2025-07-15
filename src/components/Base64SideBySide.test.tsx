import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Base64SideBySide } from './Base64SideBySide';

describe('Base64SideBySide', () => {
  it('encodes plain text to Base64', () => {
    render(<Base64SideBySide />);
    const plain = screen.getByLabelText(/plain text/i);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(plain, { target: { value: 'hello' } });
    expect(base64).toHaveValue('aGVsbG8=');
  });

  it('decodes Base64 to plain text', () => {
    render(<Base64SideBySide />);
    const plain = screen.getByLabelText(/plain text/i);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(base64, { target: { value: 'aGVsbG8=' } });
    expect(plain).toHaveValue('hello');
  });

  it('shows error for invalid Base64', () => {
    render(<Base64SideBySide />);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(base64, { target: { value: '!!!' } });
    expect(screen.getByText(/invalid base64/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plain text/i)).toHaveValue('');
  });

  it('shows no error for valid Base64', () => {
    render(<Base64SideBySide />);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(base64, { target: { value: 'aGVsbG8=' } });
    expect(screen.queryByText(/invalid base64/i)).not.toBeInTheDocument();
  });

  it('clears both fields and errors when Clear All is clicked', () => {
    render(<Base64SideBySide />);
    const plain = screen.getByLabelText(/plain text/i);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(plain, { target: { value: 'hello' } });
    fireEvent.change(base64, { target: { value: '!!!' } });
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(plain).toHaveValue('');
    expect(base64).toHaveValue('');
    expect(screen.queryByText(/invalid base64/i)).not.toBeInTheDocument();
  });

  it('does not cause infinite conversion loop', () => {
    render(<Base64SideBySide />);
    const plain = screen.getByLabelText(/plain text/i);
    const base64 = screen.getByLabelText(/base64/i);
    fireEvent.change(plain, { target: { value: 'loop' } });
    fireEvent.change(base64, { target: { value: 'bG9vcA==' } });
    expect(plain).toHaveValue('loop');
    expect(base64).toHaveValue('bG9vcA==');
  });
}); 