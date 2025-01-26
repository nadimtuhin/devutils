declare module 'cssbeautify' {
  interface CssBeautifyOptions {
    indent?: string;
    openbrace?: 'end-of-line' | 'separate-line';
    autosemicolon?: boolean;
  }

  function cssbeautify(css: string, options?: CssBeautifyOptions): string;
  export = cssbeautify;
} 