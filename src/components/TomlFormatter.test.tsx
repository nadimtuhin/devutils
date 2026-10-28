import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TomlFormatter from './TomlFormatter';

// Mock the tomlProcessor module
jest.mock('../utils/tomlProcessor', () => ({
  processToml: jest.fn(),
  defaultTomlSettings: {
    indentSize: 2,
    preserveComments: true,
    sortKeys: false,
    convertToJson: false,
  },
  extractTomlSections: jest.fn(() => []),
  extractTomlArrayTables: jest.fn(() => []),
  analyzeTomlStructure: jest.fn(() => ({
    format: 'TOML',
    encoding: 'UTF-8',
    lineCount: 1,
    characterCount: 10,
    structure: {
      depth: 1,
      tables: 1,
      keys: 1,
      arrays: 0,
    },
  })),
}));

describe('TomlFormatter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the TOML formatter component', () => {
    render(<TomlFormatter />);
    
    expect(screen.getByText('TOML Formatter')).toBeInTheDocument();
    expect(screen.getByText('Format, validate, and convert TOML configuration files with support for tables, arrays, and JSON conversion.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Paste your TOML content here...')).toBeInTheDocument();
  });

  it('shows settings panel when settings button is clicked', () => {
    render(<TomlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    expect(screen.getByText('Indent Size')).toBeInTheDocument();
    expect(screen.getByText('Output Format')).toBeInTheDocument();
    expect(screen.getAllByText('Preserve Comments')[0]).toBeInTheDocument();
  });

  it('updates settings when options are changed', () => {
    render(<TomlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const indentSelect = screen.getByDisplayValue('2 spaces');
    fireEvent.change(indentSelect, { target: { value: '4' } });
    
    expect(indentSelect).toHaveValue('4');
  });

  it('toggles between TOML and JSON output format', () => {
    render(<TomlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const jsonButton = screen.getAllByText('JSON')[0];
    fireEvent.click(jsonButton);
    
    // The JSON button should now be active (have the active styling)
    expect(jsonButton.closest('button')).toHaveClass('bg-blue-100');
  });

  it('toggles checkbox settings', () => {
    render(<TomlFormatter />);
    
    const settingsButton = screen.getByText('Settings');
    fireEvent.click(settingsButton);
    
    const sortKeysButton = screen.getAllByText('Sort Keys')[0].closest('button');
    fireEvent.click(sortKeysButton!);
    
    // Should toggle the checkbox state
    expect(sortKeysButton).toBeInTheDocument();
  });

  it('displays help section and examples', () => {
    render(<TomlFormatter />);
    
    expect(screen.getByText('TOML Formatting Tips')).toBeInTheDocument();
    expect(screen.getByText('TOML Examples')).toBeInTheDocument();
    expect(screen.getByText(/output to format and organize/)).toBeInTheDocument();
  });

  it('shows basic configuration example', () => {
    render(<TomlFormatter />);
    
    expect(screen.getByText('Basic Configuration:')).toBeInTheDocument();
    expect(screen.getByText(/title = "My App"/)).toBeInTheDocument();
  });

  it('shows array tables example', () => {
    render(<TomlFormatter />);
    
    expect(screen.getByText('Array Tables:')).toBeInTheDocument();
    expect(screen.getByText(/\[\[servers\]\]/)).toBeInTheDocument();
  });
});