// A minimal, working flat ESLint config for TypeScript + React Native.
//
// `eslint-config-expo/flat` was tried first, but its `react/display-name`
// rule (via eslint-plugin-react@7.37.5) crashes under this project's
// ESLint 9 with `contextOrFilename.getFilename is not a function` -- an
// upstream compatibility gap between eslint-plugin-react and ESLint's
// newer flat-config rule context, not something fixable from this repo.
// This config covers the rules that actually catch real bugs (TypeScript
// correctness, React Hooks rules-of-hooks/exhaustive-deps) without pulling
// in the broken rule. Swap back to `eslint-config-expo/flat` once
// eslint-plugin-react ships a fix.
const tseslint = require('typescript-eslint');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'android/**', 'ios/**'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    files: ['**/__tests__/**/*.ts', 'jest.config.js', 'jest.setup.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['eslint.config.js', 'jest.config.js', 'babel.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];
