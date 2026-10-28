import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'assets/**', 'public/**'] },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: { parser: tseslint.parser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'constructor-super': 'error', 'no-duplicate-case': 'error',
      'no-dupe-args': 'error', 'no-unreachable': 'error',
      'no-unsafe-finally': 'error', 'no-fallthrough': 'error',
      'valid-typeof': 'error', 'react-hooks/rules-of-hooks': 'error',
    },
  },
];
