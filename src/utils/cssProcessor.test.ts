import { minifyCss, beautifyCss, processCss } from './cssProcessor';

describe('cssProcessor', () => {
  describe('minifyCss', () => {
    it('should minify CSS by removing whitespace and newlines', () => {
      const input = `
        .example {
          color: red;
          margin: 10px;
        }
      `;
      const expected = '.example{color:red;margin:10px}';
      expect(minifyCss(input)).toBe(expected);
    });

    it('should handle multiple selectors', () => {
      const input = `
        .one, .two {
          margin: 0;
        }
        .three {
          padding: 10px;
        }
      `;
      const expected = '.one,.two{margin:0}.three{padding:10px}';
      expect(minifyCss(input)).toBe(expected);
    });

    it('should handle media queries', () => {
      const input = `
        @media screen and (max-width: 768px) {
          .mobile {
            display: none;
          }
        }
      `;
      const expected = '@media screen and (max-width:768px){.mobile{display:none}}';
      expect(minifyCss(input)).toBe(expected);
    });

    it('should handle keyframes', () => {
      const input = `
        @keyframes slide {
          from {
            left: 0;
          }
          to {
            left: 100%;
          }
        }
      `;
      const expected = '@keyframes slide{0%{left:0}to{left:100%}}';
      expect(minifyCss(input)).toBe(expected);
    });

    it('should handle vendor prefixes', () => {
      const input = `
        .example {
          -webkit-transform: scale(1);
          -moz-transform: scale(1);
          transform: scale(1);
        }
      `;
      const expected = '.example{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}';
      expect(minifyCss(input)).toBe(expected);
    });

    it('should throw error for empty input', () => {
      expect(() => minifyCss('')).toThrow('Empty CSS input');
      expect(() => minifyCss('   ')).toThrow('Empty CSS input');
    });

    it('should handle pseudo-classes and pseudo-elements', () => {
      const input = `
        .button:hover {
          color: blue;
        }
        .input::placeholder {
          color: gray;
        }
      `;
      const expected = '.button:hover{color:blue}.input::placeholder{color:gray}';
      expect(minifyCss(input)).toBe(expected);
    });
  });

  describe('beautifyCss', () => {
    it('should format CSS with proper indentation', () => {
      const input = '.example{color:red;margin:10px}';
      const expected = '.example {\n  color: red;\n  margin: 10px;\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle nested rules', () => {
      const input = '@media screen{.example{color:red}}';
      const expected = '@media screen {\n  .example {\n    color: red;\n  }\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle multiple selectors with proper spacing', () => {
      const input = '.one,.two{margin:0}.three{padding:10px}';
      const expected = '.one, .two {\n  margin: 0;\n}\n.three {\n  padding: 10px;\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle keyframes with proper indentation', () => {
      const input = '@keyframes slide{from{left:0}to{left:100%}}';
      const expected = '@keyframes slide {\n  from {\n    left: 0;\n  }\n  to {\n    left: 100%;\n  }\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle vendor prefixes with proper indentation', () => {
      const input = '.example{-webkit-transform:scale(1);-moz-transform:scale(1);transform:scale(1)}';
      const expected = '.example {\n  -webkit-transform: scale(1);\n  -moz-transform: scale(1);\n  transform: scale(1);\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle pseudo-classes and pseudo-elements', () => {
      const input = '.button:hover{color:blue}.input::placeholder{color:gray}';
      const expected = '.button:hover {\n  color: blue;\n}\n.input::placeholder {\n  color: gray;\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should handle comments', () => {
      const input = '/*Header styles*/.header{color:black}';
      const expected = '/*Header styles*/\n.header {\n  color: black;\n}';
      expect(beautifyCss(input)).toBe(expected);
    });

    it('should throw error for empty input', () => {
      expect(() => beautifyCss('')).toThrow('Empty CSS input');
      expect(() => beautifyCss('   ')).toThrow('Empty CSS input');
    });
  });

  describe('processCss', () => {
    it('should minify CSS when mode is minify', () => {
      const input = `
        .example {
          color: red;
        }
      `;
      const expected = '.example{color:red}';
      expect(processCss(input, 'minify')).toBe(expected);
    });

    it('should beautify CSS when mode is beautify', () => {
      const input = '.example{color:red}';
      const expected = '.example {\n  color: red;\n}';
      expect(processCss(input, 'beautify')).toBe(expected);
    });

    it('should handle invalid CSS gracefully', () => {
      const input = '.test { color: red; // missing closing brace';
      expect(() => processCss(input, 'beautify')).toThrow();
      expect(() => processCss(input, 'minify')).toThrow();
    });

    it('should throw error for empty input', () => {
      expect(() => processCss('', 'minify')).toThrow('Please enter some CSS code first');
      expect(() => processCss('   ', 'beautify')).toThrow('Please enter some CSS code first');
    });
  });
}); 