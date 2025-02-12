import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CssMinifyBeautify from './CssMinifyBeautify';

describe('CssMinifyBeautify', () => {
  const testCases = {
    basic: {
      input: `
        .test {
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
    render(<CssMinifyBeautify />);
  });

  it('renders without crashing', () => {
    expect(screen.getByText('CSS Minify/Beautify')).toBeInTheDocument();
  });

  it('shows error for empty input', () => {
    const convertButton = screen.getByText('Beautify');
    fireEvent.click(convertButton);
    expect(screen.getByText('Please enter some CSS code first')).toBeInTheDocument();
  });

  Object.entries(testCases).forEach(([name, { input, minified, beautified }]) => {
    describe(`${name} CSS`, () => {
      it('minifies correctly', () => {
        // Switch to minify mode
        fireEvent.click(screen.getByLabelText('Minify'));
        
        // Input the CSS
        const inputEditor = screen.getByPlaceholderText('Enter CSS code here...');
        fireEvent.change(inputEditor, { target: { value: input } });
        
        // Click convert button
        const convertButton = screen.getByText('Minify');
        fireEvent.click(convertButton);
        
        // Check output
        const outputEditor = screen.getByDisplayValue(minified);
        expect(outputEditor).toBeInTheDocument();
      });

      it('beautifies correctly', () => {
        // Switch to beautify mode
        fireEvent.click(screen.getByLabelText('Beautify'));
        
        // Input the CSS
        const inputEditor = screen.getByPlaceholderText('Enter CSS code here...');
        fireEvent.change(inputEditor, { target: { value: input } });
        
        // Click convert button
        const convertButton = screen.getByText('Beautify');
        fireEvent.click(convertButton);
        
        // Check output
        const outputEditor = screen.getByDisplayValue(beautified);
        expect(outputEditor).toBeInTheDocument();
      });
    });
  });

  it('handles invalid CSS input', () => {
    const invalidCss = '.test { color: red; // missing closing brace';
    
    const inputEditor = screen.getByPlaceholderText('Enter CSS code here...');
    fireEvent.change(inputEditor, { target: { value: invalidCss } });
    
    const convertButton = screen.getByText('Beautify');
    fireEvent.click(convertButton);
    
    expect(screen.getByText(/Failed to process CSS/)).toBeInTheDocument();
  });
}); 