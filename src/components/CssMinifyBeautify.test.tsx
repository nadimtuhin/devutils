/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CssMinifyBeautify from './CssMinifyBeautify';
import { processCss } from '../utils/cssProcessor';

// Mock the cssProcessor module
jest.mock('../utils/cssProcessor');

describe('CssMinifyBeautify', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock: echo mode-specific placeholder
    (processCss as jest.Mock).mockImplementation((css, mode) => {
      if (!css.trim()) throw new Error('Please enter some CSS code first');
      return mode === 'minify' ? 'minified-css' : 'beautified-css';
    });
  });

  it('renders without crashing', () => {
    render(<CssMinifyBeautify />);
    expect(screen.getByText('CSS Minify/Beautify')).toBeInTheDocument();
  });

  it('starts in beautify mode', () => {
    render(<CssMinifyBeautify />);
    expect(screen.getByLabelText('Beautify')).toBeChecked();
    expect(screen.getByLabelText('Minify')).not.toBeChecked();
  });

  it('switches between beautify and minify modes', () => {
    render(<CssMinifyBeautify />);
    const minifyRadio = screen.getByLabelText('Minify');
    fireEvent.click(minifyRadio);
    expect(minifyRadio).toBeChecked();
    expect(screen.getByLabelText('Beautify')).not.toBeChecked();
  });

  it('processes CSS when clicking the button in beautify mode', () => {
    render(<CssMinifyBeautify />);
    const input = '.test{color:red}';
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: input } });
    fireEvent.click(screen.getByRole('button', { name: 'Beautify' }));
    expect(processCss).toHaveBeenCalledWith(input, 'beautify');
    expect(screen.getByTestId('code-editor-output')).toHaveTextContent('beautified-css');
  });

  it('processes CSS when clicking the button in minify mode', () => {
    render(<CssMinifyBeautify />);
    const input = '.test { color: red; }';
    fireEvent.click(screen.getByLabelText('Minify'));
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: input } });
    fireEvent.click(screen.getByRole('button', { name: 'Minify' }));
    expect(processCss).toHaveBeenCalledWith(input, 'minify');
    expect(screen.getByTestId('code-editor-output')).toHaveTextContent('minified-css');
  });

  it('displays error message when processing empty input', () => {
    render(<CssMinifyBeautify />);
    fireEvent.click(screen.getByRole('button', { name: 'Beautify' }));
    // Component translates the "Please enter" error to the generic message
    expect(screen.getByTestId('code-editor-output')).toHaveTextContent(
      'Failed to process CSS. Please check your input for syntax errors.'
    );
  });

  it('displays error message when processing fails', () => {
    (processCss as jest.Mock).mockImplementation(() => {
      throw new Error('Test error message');
    });
    render(<CssMinifyBeautify />);
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: '.test{color:red}' } });
    fireEvent.click(screen.getByRole('button', { name: 'Beautify' }));
    expect(screen.getByTestId('code-editor-output')).toHaveTextContent('Test error message');
  });

  it('handles invalid CSS input', () => {
    // Override mock for this test to simulate parse error
    (processCss as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to process CSS. Please check your input for syntax errors.');
    });
    render(<CssMinifyBeautify />);
    const invalidCss = '.test { color: red; // missing closing brace';
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: invalidCss } });
    fireEvent.click(screen.getByRole('button', { name: 'Beautify' }));
    expect(screen.getByTestId('code-editor-output')).toHaveTextContent(
      'Failed to process CSS. Please check your input for syntax errors.'
    );
  });
});
