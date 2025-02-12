import { minify, syntax } from 'csso';

type CssNode = {
  type: string;
  children?: CssNode[];
  prelude?: { 
    type?: string;
    value?: string;
    children?: Array<{ name: string }>;
  };
  block?: { children: CssNode[] };
  property?: string;
  value?: { value: string };
  name?: string;
  important?: boolean;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
};

const getPreludeValue = (prelude: CssNode['prelude']): string => {
  if (!prelude) return '';
  if (prelude.type === 'AtrulePrelude') {
    return prelude.children?.map(child => child.name).join(' ') || '';
  }
  return prelude.value || '';
};

export const minifyCss = (css: string): string => {
  if (!css.trim()) {
    throw new Error('Empty CSS input');
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

export const beautifyCss = (css: string): string => {
  if (!css.trim()) {
    throw new Error('Empty CSS input');
  }

  try {
    const ast = syntax.parse(css.trim());
    let indentLevel = 0;
    let beautified = '';
    let lastNodeType = '';

    const walk = (node: CssNode) => {
      switch (node.type) {
        case 'StyleSheet':
          node.children?.forEach((child, index) => {
            // Add newline between rules, but not before the first one
            if (index > 0 && lastNodeType !== 'Comment') beautified += '\n';
            walk(child);
            lastNodeType = child.type;
          });
          break;

        case 'Rule':
          if (node.prelude?.value && node.block) {
            // Add newline if not the first rule and previous node wasn't a comment
            if (beautified && lastNodeType !== 'Comment') beautified += '\n';
            beautified += '  '.repeat(indentLevel) + node.prelude.value + ' {';
            indentLevel++;
            node.block.children.forEach(child => {
              beautified += '\n';
              walk(child);
            });
            indentLevel--;
            beautified += '\n' + '  '.repeat(indentLevel) + '}';
          }
          break;

        case 'Declaration':
          if (node.property) {
            beautified += '  '.repeat(indentLevel) + node.property;
            if (node.value?.value) {
              beautified += ': ' + node.value.value;
            }
            beautified += ';';
          }
          break;

        case 'Atrule':
          if (node.name) {
            // Add newline if not the first rule and previous node wasn't a comment
            if (beautified && lastNodeType !== 'Comment') beautified += '\n';
            beautified += '  '.repeat(indentLevel) + '@' + node.name;
            const preludeValue = getPreludeValue(node.prelude);
            if (preludeValue) {
              beautified += ' ' + preludeValue;
            }
            if (node.block) {
              beautified += ' {';
              indentLevel++;
              node.block.children.forEach(child => {
                beautified += '\n';
                walk(child);
              });
              indentLevel--;
              beautified += '\n' + '  '.repeat(indentLevel) + '}';
            } else {
              beautified += ';';
            }
          }
          break;

        case 'Comment':
          // Add newline before comment if it's not the first node
          if (beautified) beautified += '\n';
          beautified += '  '.repeat(indentLevel) + node.value?.value;
          break;
      }
    };

    walk(ast);
    return beautified.trim();
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