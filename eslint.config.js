import js from '@eslint/js';
import react from 'eslint-plugin-react';
import prettier from 'eslint-plugin-prettier';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react,
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'prettier/prettier': 'warn',
    },
  },
];
