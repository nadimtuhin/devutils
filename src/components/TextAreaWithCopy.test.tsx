import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { TextAreaWithCopy } from './TextAreaWithCopy';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('TextAreaWithCopy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders label, textarea, and copy button', () => {
    render(<TextAreaWithCopy value="foo" label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<TextAreaWithCopy value="foo" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'bar' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message and red border', () => {
    render(<TextAreaWithCopy value="foo" error="Error!" />);
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
  });

  it('shows visual feedback on successful copy', async () => {
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);
    render(<TextAreaWithCopy value="copied!" />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/copied!/i));
  });

  it('shows visual feedback on failed copy', async () => {
    (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    render(<TextAreaWithCopy value="fail!" />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/failed/i));
  });

  it('does not show copy button as success/error after timeout', async () => {
    jest.useFakeTimers();
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(undefined);
    render(<TextAreaWithCopy value="foo" />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => expect(screen.getByRole('button')).toHaveTextContent(/copied!/i));
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.getByRole('button')).toHaveTextContent(/copy/i);
    jest.useRealTimers();
  });

  it('uses fallback copy method if clipboard API is unavailable', async () => {
    const originalClipboard = navigator.clipboard;
    // @ts-ignore
    delete navigator.clipboard;
    document.execCommand = jest.fn();
    render(<TextAreaWithCopy value="fallback!" />);
    fireEvent.click(screen.getByRole('button', { name: /copy/i }));
    await waitFor(() => expect(document.execCommand).toHaveBeenCalledWith('copy'));
    // @ts-ignore
    navigator.clipboard = originalClipboard;
  });
}); 