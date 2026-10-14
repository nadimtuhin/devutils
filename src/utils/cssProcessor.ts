import { minify } from 'csso';

export const minifyCss = (css: string): string => {
  if (!css.trim()) {
    throw new Error('Empty CSS input');
  }

  // csso silently drops unparseable tails, so reject malformed input first
  try {
    beautifyCss(css);
  } catch (error) {
    throw new Error(`Failed to minify CSS: ${error instanceof Error ? error.message : "Invalid syntax"}`);
  }

  try {
    const minified = minify(css, {
      restructure: true,
      comments: false,
    });
    return minified.css;
  } catch (error) {
    throw new Error(`Failed to minify CSS: ${error instanceof Error ? error.message : 'Invalid syntax'}`);
  }
};

const INDENT = '  ';

const squash = (text: string): string => text.replace(/\s+/g, ' ').trim();

const splitTopLevel = (text: string, separator: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
};

const formatPrelude = (prelude: string): string => {
  const text = squash(prelude);
  if (text.startsWith('@')) return text.replace(/\s*:\s*/g, ': ');
  return splitTopLevel(text, ',').map(squash).join(', ');
};

const formatDeclaration = (statement: string): string => {
  const text = squash(statement);
  if (text.startsWith('@')) return text;
  const colon = text.indexOf(':');
  if (colon === -1) return text;
  return `${text.slice(0, colon).trim()}: ${text.slice(colon + 1).trim()}`;
};

export const beautifyCss = (css: string): string => {
  if (!css.trim()) {
    throw new Error('Empty CSS input');
  }

  const lines: string[] = [];
  let indentLevel = 0;
  let buffer = '';
  let quote = '';
  let parenDepth = 0;

  const emit = (text: string) => lines.push(INDENT.repeat(indentLevel) + text);
  const flushDeclaration = () => {
    if (squash(buffer)) emit(`${formatDeclaration(buffer)};`);
    buffer = '';
  };

  try {
    for (let i = 0; i < css.length; i++) {
      const ch = css[i];
      if (quote) {
        buffer += ch;
        if (ch === '\\') buffer += css[++i] ?? '';
        else if (ch === quote) quote = '';
      } else if (ch === '/' && css[i + 1] === '*') {
        const end = css.indexOf('*/', i + 2);
        if (end === -1) throw new Error('Unterminated comment');
        const comment = css.slice(i, end + 2);
        if (squash(buffer)) buffer += comment;
        else emit(comment);
        i = end + 1;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
        buffer += ch;
      } else if (ch === '(') {
        parenDepth++;
        buffer += ch;
      } else if (ch === ')') {
        parenDepth--;
        buffer += ch;
      } else if (ch === '{' && parenDepth === 0) {
        emit(`${formatPrelude(buffer)} {`);
        buffer = '';
        indentLevel++;
      } else if (ch === ';' && parenDepth === 0) {
        flushDeclaration();
      } else if (ch === '}' && parenDepth === 0) {
        flushDeclaration();
        indentLevel--;
        if (indentLevel < 0) throw new Error('Unexpected }');
        emit('}');
      } else {
        buffer += ch;
      }
    }
    if (quote || indentLevel !== 0 || squash(buffer)) {
      throw new Error('Unbalanced braces or incomplete statement');
    }
    return lines.join('\n');
  } catch (error) {
    throw new Error(`Failed to beautify CSS: ${error instanceof Error ? error.message : 'Invalid syntax'}`);
  }
};

export const processCss = (css: string, mode: 'minify' | 'beautify'): string => {
  if (!css.trim()) {
    throw new Error('Please enter some CSS code first');
  }

  try {
    return mode === 'minify' ? minifyCss(css) : beautifyCss(css);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process CSS. Please check your input for syntax errors.');
  }
};
