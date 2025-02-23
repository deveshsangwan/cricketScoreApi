import typeScriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  {
    languageOptions: {
      parser: typeScriptParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        myCustomGlobal: 'readonly'
      }
    }
  },
  {
    rules: {
      'no-console': 'warn',
      'indent': ['error', 4],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-unused-vars': ['warn'],
      'eqeqeq': ['error', 'always'],
      'curly': ['error']
    }
  },
  {
    files: ['app/**/*.ts', 'test/**/*.ts'],
  },
  {
    files: ['*.js'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    files: ['*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'error'
    }
  }
]