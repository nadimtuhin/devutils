import { minify, syntax } from 'csso';

export const minifyCss = (css: string): string => {
  if (!css.trim()) {
    throw new Error('Empty CSS input');
  }
  
  try {
    // Force parse error checks since csso defaults to tolerant parsing
    syntax.parse(css.trim(), {
      onParseError: (err) => {
        throw err;
      }
    });

    const minified = minify(css, {
      restructure: true,
      comments: false,
      colorHex: false,
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
    const ast = syntax.parse(css.trim(), {
      onParseError: (err) => {
        throw err;
      }
    }) as any;
    let indentLevel = 0;
    let beautified = '';

    const walk = (node: any) => {
      switch (node.type) {
        case 'StyleSheet':
          node.children.forEach((child: any) => {
            if (beautified) beautified += '\n';
            walk(child);
          });
          break;

        case 'Rule':
          if (node.block) {
            let selector = (syntax as any).generate(node.prelude);
            if (beautified && beautified[beautified.length - 1] !== '\n') beautified += '\n';
            beautified += '  '.repeat(indentLevel) + selector + ' {';
            indentLevel++;
            node.block.children.forEach((child: any, idx: number) => {
              if (idx > 0) beautified += '\n';
              walk(child);
            });
            indentLevel--;
            beautified += '\n' + '  '.repeat(indentLevel) + '}';
          }
          break;

        case 'Declaration':
          if (node.property) {
            if (beautified && beautified[beautified.length - 1] !== '\n') beautified += '\n';
            beautified += '  '.repeat(indentLevel) + node.property + ': ' + (syntax as any).generate(node.value) + ';';
          }
          break;

        case 'Atrule':
          if (node.name) {
            if (beautified && beautified[beautified.length - 1] !== '\n') beautified += '\n';
            beautified += '  '.repeat(indentLevel) + '@' + node.name;
            if (node.prelude) {
              beautified += ' ' + (syntax as any).generate(node.prelude);
            }
            if (node.block) {
              beautified += ' {';
              indentLevel++;
              node.block.children.forEach((child: any, idx: number) => {
                if (idx > 0) beautified += '\n';
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
          if (beautified) beautified += '\n';
          beautified += '  '.repeat(indentLevel) + '/*' + node.value + '*/';
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