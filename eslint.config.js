import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactPlugin from 'eslint-plugin-react';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      reactPlugin.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: latest,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      react: reactPlugin,
      jest: jestPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      jest: {
        version: 'detect',
        globalAliases: {
          describe: ['context'],
          fdescribe: ['fcontext'],
          xdescribe: ['xcontext'],
        },
      },
    },
    rules: {
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      semi: ['error', 'always'],
      'space-before-function-paren': 'off',
      camelcase: 'off',
      'no-return-assign': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
    },
  },
]);
