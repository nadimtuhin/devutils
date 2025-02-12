/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CssMinifyBeautify from './CssMinifyBeautify';
import { processCss } from '../utils/cssProcessor';

// Mock the cssProcessor module
jest.mock('../utils/cssProcessor');

describe('CssMinifyBeautify', () => {
  const testCases = {
    basic: {
      input: `.test {
  color: red;
  font-size: 16px;
}`,
      minified: '.test{color:red;font-size:16px}',
      beautified: `.test {
  color: red;
  font-size: 16px;
}`
    },
    mediaQuery: {
      input: `@media screen and (max-width: 768px) { .mobile { display: none; } }`,
      minified: '@media screen and (max-width:768px){.mobile{display:none}}',
      beautified: `@media screen and (max-width: 768px) {
  .mobile {
    display: none;
  }
}`
    },
    multipleSelectors: {
      input: `.one, .two { margin: 0; } .three { padding: 10px; }`,
      minified: '.one,.two{margin:0}.three{padding:10px}',
      beautified: `.one, .two {
  margin: 0;
}
.three {
  padding: 10px;
}`
    },
    keyframes: {
      input: `@keyframes slide { from { left: 0; } to { left: 100%; } }`,
      minified: '@keyframes slide{0%{left:0}to{left:100%}}',
      beautified: `@keyframes slide {
  from {
    left: 0;
  }
  to {
    left: 100%;
  }
}`
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Default mock implementation
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
    fireEvent.click(screen.getByText('Beautify'));

    expect(processCss).toHaveBeenCalledWith(input, 'beautify');
    expect(screen.getByTestId('code-editor')).toHaveTextContent('beautified-css');
  });

  it('processes CSS when clicking the button in minify mode', () => {
    render(<CssMinifyBeautify />);
    
    const input = '.test { color: red; }';
    fireEvent.click(screen.getByLabelText('Minify'));
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: input } });
    fireEvent.click(screen.getByText('Minify'));

    expect(processCss).toHaveBeenCalledWith(input, 'minify');
    expect(screen.getByTestId('code-editor')).toHaveTextContent('minified-css');
  });

  it('displays error message when processing empty input', () => {
    render(<CssMinifyBeautify />);
    
    fireEvent.click(screen.getByText('Beautify'));
    expect(screen.getByTestId('code-editor')).toHaveTextContent('Please enter some CSS code first');
  });

  it('displays error message when processing fails', () => {
    (processCss as jest.Mock).mockImplementation(() => {
      throw new Error('Test error message');
    });

    render(<CssMinifyBeautify />);
    
    fireEvent.change(screen.getByTestId('code-editor'), { target: { value: '.test{color:red}' } });
    fireEvent.click(screen.getByText('Beautify'));

    expect(screen.getByTestId('code-editor')).toHaveTextContent('Test error message');
  });

  Object.entries(testCases).forEach(([name, { input, minified, beautified }]) => {
    describe(`${name} CSS`, () => {
      it('minifies correctly', () => {
        // Switch to minify mode
        fireEvent.click(screen.getByRole('radio', { name: 'Minify' }));
        
        // Input the CSS
        const [inputEditor] = screen.getAllByTestId('code-editor');
        fireEvent.change(inputEditor, { target: { value: input } });
        
        // Click convert button
        const convertButton = screen.getByRole('button', { name: 'Minify' });
        fireEvent.click(convertButton);
        
        // Check output
        const [, outputEditor] = screen.getAllByTestId('code-editor');
        console.log('Minify Test Output:', {
          name,
          expected: minified,
          received: (outputEditor as HTMLTextAreaElement).value
        });
        expect(outputEditor).toHaveValue(minified);
      });

      it('beautifies correctly', () => {
        // Switch to beautify mode
        fireEvent.click(screen.getByRole('radio', { name: 'Beautify' }));
        
        // Input the CSS
        const [inputEditor] = screen.getAllByTestId('code-editor');
        fireEvent.change(inputEditor, { target: { value: input } });
        
        // Click convert button
        const convertButton = screen.getByRole('button', { name: 'Beautify' });
        fireEvent.click(convertButton);
        
        // Check output
        const [, outputEditor] = screen.getAllByTestId('code-editor');
        console.log('Beautify Test Output:', {
          name,
          expected: beautified,
          received: (outputEditor as HTMLTextAreaElement).value
        });
        expect(outputEditor).toHaveValue(beautified);
      });
    });
  });

  it('handles invalid CSS input', () => {
    const invalidCss = '.test { color: red; // missing closing brace';
    
    const [inputEditor] = screen.getAllByTestId('code-editor');
    fireEvent.change(inputEditor, { target: { value: invalidCss } });
    
    const convertButton = screen.getByRole('button', { name: 'Beautify' });
    fireEvent.click(convertButton);
    
    const [, outputEditor] = screen.getAllByTestId('code-editor');
    console.log('Invalid CSS Test Output:', {
      expected: 'Failed to process CSS. Please check your input for syntax errors.',
      received: (outputEditor as HTMLTextAreaElement).value
    });
    expect(outputEditor).toHaveValue('Failed to process CSS. Please check your input for syntax errors.');
  });
}); 