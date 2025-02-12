/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '@uiw/react-textarea-code-editor': '<rootDir>/src/components/__mocks__/@uiw/react-textarea-code-editor.tsx',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: 'tsconfig.test.json'
    }],
    '^.+\\.m?jsx?$': ['babel-jest', { rootMode: 'upward' }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@uiw/react-textarea-code-editor|rehype|unified|unist|vfile|bail|trough|is-plain-obj|property-information|space-separated-tokens|comma-separated-tokens|hast|web-namespaces|zwitch|html-void-elements)/)',
  ],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
}; 