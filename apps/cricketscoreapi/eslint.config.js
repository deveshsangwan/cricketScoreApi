const typeScriptParser = require('@typescript-eslint/parser');
const globals = require('globals');
const prettier = require('eslint-plugin-prettier');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');

module.exports = [
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
    plugins: {
      prettier: prettier,
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      'no-console': 'warn',
      'indent': ['error', 4],
      'linebreak-style': ['error', 'unix'],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      // Turn off standard no-unused-vars and use the TypeScript one
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_'
      }],
      'eqeqeq': ['error', 'always'],
      'curly': ['error'],
      'prettier/prettier': ['error', {
        // Ensure prettier settings match .prettierrc.js
        'semi': true,
        'singleQuote': true,
        'tabWidth': 4,
        'printWidth': 100,
        'trailingComma': 'es5',
        'endOfLine': 'lf'
      }]
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