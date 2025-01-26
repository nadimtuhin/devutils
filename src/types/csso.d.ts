declare module 'csso' {
  interface MinifyOptions {
    restructure?: boolean;
    comments?: boolean;
  }

  interface MinifyResult {
    css: string;
    map?: object;
  }

  interface CssNode {
    type: string;
    children?: CssNode[];
  }

  interface StyleSheetNode extends CssNode {
    type: 'StyleSheet';
    children: CssNode[];
  }

  interface RuleNode extends CssNode {
    type: 'Rule';
    prelude: { value: string };
    block: { children: CssNode[] };
  }

  interface DeclarationNode extends CssNode {
    type: 'Declaration';
    property: string;
    value: { value: string };
  }

  export function minify(css: string, options?: MinifyOptions): MinifyResult;

  export const syntax: {
    parse(css: string): StyleSheetNode;
  };
} 