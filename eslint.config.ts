// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import boundaries from 'eslint-plugin-boundaries'

export default tseslint.config(
  {
    ignores: [
      'node_modules',
      'dist',
      '.output',
      '.tanstack',
      'src/routeTree.gen.ts',
      'playwright-report',
      'test-results',
      'commitlint.config.js',
      'prettier.config.js',
      'server.entry.mjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: [
      '*.config.js',
      '*.config.ts',
      'commitlint.config.js',
      'prettier.config.js',
    ],
    extends: [tseslint.configs.disableTypeChecked],
  },
  // @ts-expect-error — eslint-plugin-react's flat config types lag its runtime export
  react.configs.flat.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/routes/**' },
        { type: 'feature', pattern: 'src/features/*', capture: ['slice'] },
        { type: 'server', pattern: 'src/server/**' },
        { type: 'contracts', pattern: 'src/contracts/**' },
        { type: 'shared', pattern: 'src/shared/**' },
        { type: 'mocks', pattern: 'src/mocks/**' },
      ],
    },
    plugins: {
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
      boundaries,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            {
              pattern: '~/contracts/**',
              group: 'internal',
              position: 'before',
            },
            { pattern: '~/server/**', group: 'internal', position: 'before' },
            { pattern: '~/features/**', group: 'internal', position: 'before' },
            { pattern: '~/shared/**', group: 'internal', position: 'before' },
          ],
          'newlines-between': 'always',
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'routes', allow: ['feature', 'shared', 'contracts'] },
            {
              from: 'feature',
              allow: [
                ['feature', { slice: '${from.slice}' }],
                'shared',
                'contracts',
              ],
            },
            { from: 'server', allow: ['contracts', 'shared'] },
            { from: 'shared', allow: ['shared', 'contracts'] },
            // `mocks` is a stand-in backend, not app code: it legitimately needs to speak
            // the same ApiError vocabulary the real http client parses (`~/server/api-client/api-error`).
            { from: 'mocks', allow: ['contracts', 'shared', 'server'] },
          ],
        },
      ],
      'boundaries/entry-point': [
        'error',
        {
          default: 'disallow',
          rules: [{ target: ['feature'], allow: 'index.ts' }],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['~/server/*'],
              message:
                'Server code may only be imported from *.serverfns.ts files.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/features/*/api/*.serverfns.ts',
      'src/server/**',
      'src/routes/api/**',
      'src/mocks/**',
    ],
    rules: { 'no-restricted-imports': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
)
