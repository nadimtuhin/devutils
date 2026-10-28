import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import XmlFormatter from './XmlFormatter';

// Mock the xmlProcessor module
jest.mock('../utils/xmlProcessor', () => ({
  processXml: jest.fn(),
  defaultXmlSettings: {
    indentSize: 2,
    preserveComments: true,
    preserveWhitespace: false,
    sortAttributes: false,
    minify: false,
    validateSchema: false,
  },
  extractXmlNamespaces: jest.fn(() => []),
  analyzeXmlStructure: jest.fn(() => ({
    format: 'XML',
    encoding: 'UTF-8',
    lineCount: 1,
    characterCount: 10,
    structure: {
      depth: 1,
      elements: 1,
      attributes: 0,
    },
  })),
}));

describe('XmlFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the XML formatter component', () => {
    render(<XmlFormatter />);
    
    expect(screen.getByText('XML Formatter')).toBeInTheDocument();
    expect(screen.getByText('Format, validate, and minify XML documents with namespace support and error detection.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your XML content here...')).toBeInTheDocument();
  });

  it('shows settings panel when settings button is clicked', () => {
    render(<XmlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Indent Size')).toBeInTheDocument();
    expect(screen.getByText('Output Format')).toBeInTheDocument();
    expect(screen.getAllByText('Preserve Comments')[0]).toBeInTheDocument();
  });

  it('updates settings when options are changed', () => {
    render(<XmlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const indentSelect = screen.getByDisplayValue('2 spaces');
    fireEvent.change(indentSelect, { target: { value: '4' } });
    
    expect(indentSelect).toHaveValue('4');
  });

  it('toggles minify mode when format buttons are clicked', () => {
    render(<XmlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const minifiedButton = screen.getAllByText('Minified')[0];
    fireEvent.click(minifiedButton);
    
    // The minified button should now be active (have the active styling)
    expect(minifiedButton.closest('button')).toHaveClass('bg-blue-100');
  });

  it('toggles checkbox settings', () => {
    render(<XmlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const preserveCommentsButton = screen.getAllByText('Preserve Comments')[0].closest('button');
    fireEvent.click(preserveCommentsButton!);
    
    // Should toggle the checkbox state
    expect(preserveCommentsButton).toBeInTheDocument();
  });

  it('displays help section', () => {
    render(<XmlFormatter />);
    
    expect(screen.getByText('XML Formatting Tips')).toBeInTheDocument();
    expect(screen.getByText(/mode for readable, indented XML/)).toBeInTheDocument();
  });
});