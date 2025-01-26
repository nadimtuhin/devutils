declare module 'html-minifier-terser' {
  interface MinifyOptions {
    caseSensitive?: boolean;
    collapseBooleanAttributes?: boolean;
    collapseInlineTagWhitespace?: boolean;
    collapseWhitespace?: boolean;
    conservativeCollapse?: boolean;
    customAttrAssign?: RegExp[];
    customAttrCollapse?: RegExp;
    customAttrSurround?: RegExp[];
    customEventAttributes?: RegExp[];
    decodeEntities?: boolean;
    html5?: boolean;
    ignoreCustomComments?: RegExp[];
    ignoreCustomFragments?: RegExp[];
    includeAutoGeneratedTags?: boolean;
    keepClosingSlash?: boolean;
    maxLineLength?: number;
    minifyCSS?: boolean | object;
    minifyJS?: boolean | object;
    minifyURLs?: boolean | object;
    preserveLineBreaks?: boolean;
    preventAttributesEscaping?: boolean;
    processConditionalComments?: boolean;
    processScripts?: string[];
    quoteCharacter?: string;
    removeAttributeQuotes?: boolean;
    removeComments?: boolean;
    removeEmptyAttributes?: boolean;
    removeEmptyElements?: boolean;
    removeOptionalTags?: boolean;
    removeRedundantAttributes?: boolean;
    removeScriptTypeAttributes?: boolean;
    removeStyleLinkTypeAttributes?: boolean;
    removeTagWhitespace?: boolean;
    sortAttributes?: boolean;
    sortClassName?: boolean;
    trimCustomFragments?: boolean;
    useShortDoctype?: boolean;
  }

  export function minify(text: string, options?: MinifyOptions): Promise<string>;
} 