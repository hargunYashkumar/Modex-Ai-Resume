import js              from '@eslint/js'
import reactPlugin     from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals         from 'globals'

export default [
  // Base JS recommended rules
  js.configs.recommended,

  {
    files: ['src/**/*.{js,jsx}'],

    plugins: {
      react:       reactPlugin,
      'react-hooks': reactHooksPlugin,
    },

    languageOptions: {
      ecmaVersion:   2022,
      sourceType:    'module',
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      // React
      'react/react-in-jsx-scope':       'off',   // not needed with React 17+ transform
      'react/prop-types':               'off',   // we use JSDoc/TypeScript-style comments
      'react/display-name':             'warn',
      'react/no-unescaped-entities':    'warn',
      'react/jsx-key':                  'error',  // always require key in lists

      // React Hooks
      'react-hooks/rules-of-hooks':     'error',
      'react-hooks/exhaustive-deps':    'warn',

      // General
      'no-unused-vars':                 ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console':                     ['warn', { allow: ['warn', 'error', 'debug'] }],
      'no-debugger':                    'error',
      'no-undef':                       'error',
      'prefer-const':                   'warn',
      'no-var':                         'error',
      'eqeqeq':                         ['error', 'always', { null: 'ignore' }],
    },
  },

  // Ignore build output and config files
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'postcss.config.js'],
  },
]
