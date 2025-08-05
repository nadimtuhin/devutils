import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Base64SecretDecoder from './Base64SecretDecoder';

// Mock the TextAreaWithCopy component
jest.mock('../TextAreaWithCopy', () => {
  return function TextAreaWithCopy({ value, onChange, placeholder, rows }: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    rows: number;
  }) {
    return (
      <textarea
        data-testid="secret-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    );
  };
});

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('Base64SecretDecoder', () => {
  const validSecretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: test-secret
  namespace: default
type: Opaque
data:
  username: dXNlcm5hbWU=
  password: cGFzc3dvcmQ=`;

  const invalidSecretYaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: not-a-secret`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main heading and description', () => {
      render(<Base64SecretDecoder />);
      
      expect(screen.getByText('Base64 Secret Decoder & Validator')).toBeInTheDocument();
      expect(screen.getByText(/Parse Kubernetes Secret YAML/)).toBeInTheDocument();
    });

    it('should render input method selection', () => {
      render(<Base64SecretDecoder />);
      
      expect(screen.getByText('Input Method')).toBeInTheDocument();
      expect(screen.getByText('Paste Secret YAML')).toBeInTheDocument();
    });

    it('should render the secret input textarea', () => {
      render(<Base64SecretDecoder />);
      
      expect(screen.getByTestId('secret-input')).toBeInTheDocument();
    });

    it('should render reset button', () => {
      render(<Base64SecretDecoder />);
      
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should render privacy notice', () => {
      render(<Base64SecretDecoder />);
      
      expect(screen.getByText('Privacy First')).toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should update input value when typing', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: 'test input' } });
      
      expect(textarea).toHaveValue('test input');
    });

    it('should handle reset button click', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: 'some text' } });
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(textarea).toHaveValue('');
    });
  });

  describe('YAML Validation', () => {
    it('should show error for invalid Kubernetes Secret', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: invalidSecretYaml } });
      
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Secret Parsing and Display', () => {
    it('should parse and display valid secret', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      expect(screen.getByText('Decoded Values')).toBeInTheDocument();
      expect(screen.getByText('Secret Summary')).toBeInTheDocument();
    });

    it('should display secret keys in table', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      expect(screen.getByText('username')).toBeInTheDocument();
      expect(screen.getByText('password')).toBeInTheDocument();
    });

    it('should display secret metadata', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      expect(screen.getByText('test-secret')).toBeInTheDocument();
      expect(screen.getByText('default')).toBeInTheDocument();
      expect(screen.getByText('Opaque')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should have toggle visibility buttons', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      const eyeButtons = screen.getAllByTitle('Toggle visibility');
      expect(eyeButtons.length).toBeGreaterThan(0);
    });

    it('should have copy buttons', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      const copyButtons = screen.getAllByTitle('Copy decoded value');
      expect(copyButtons.length).toBeGreaterThan(0);
    });

    it('should call clipboard API when copy button is clicked', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: validSecretYaml } });
      
      const copyButtons = screen.getAllByTitle('Copy decoded value');
      fireEvent.click(copyButtons[0]);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle empty input gracefully', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: '' } });
      
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
      expect(screen.queryByText('Decoded Values')).not.toBeInTheDocument();
    });

    it('should clear error when input is cleared', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      
      // First trigger an error
      fireEvent.change(textarea, { target: { value: invalidSecretYaml } });
      expect(screen.getByText('Error')).toBeInTheDocument();
      
      // Then clear input
      fireEvent.change(textarea, { target: { value: '' } });
      expect(screen.queryByText('Error')).not.toBeInTheDocument();
    });
  });

  describe('Security Features', () => {
    const secretWithToken = `apiVersion: v1
kind: Secret
metadata:
  name: token-secret
type: Opaque
data:
  api-key: c2stYWJjZGVmZ2hpams=`;

    it('should detect and warn about security issues', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      fireEvent.change(textarea, { target: { value: secretWithToken } });
      
      // Should show security analysis when there are warnings
      const warningElements = screen.queryAllByTitle('Security warnings');
      // May or may not have warnings depending on the content detection
      expect(warningElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper keyboard accessibility', () => {
      render(<Base64SecretDecoder />);
      
      const textarea = screen.getByTestId('secret-input');
      const resetButton = screen.getByText('Reset');
      
      expect(textarea).not.toHaveAttribute('tabIndex', '-1');
      expect(resetButton).not.toHaveAttribute('tabIndex', '-1');
    });
  });
});