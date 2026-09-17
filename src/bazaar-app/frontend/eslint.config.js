// @ts-check
const path = require('path');
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      boundaries,
    },
    settings: {
      'import/resolver': { typescript: { project: path.join(__dirname, 'tsconfig.json') } },
      'boundaries/include': ['src/app/**/*.ts'],
      'boundaries/elements': [
        { type: 'core', pattern: 'src/app/core/**' },
        { type: 'shared', pattern: 'src/app/shared/**' },
        { type: 'feature', pattern: 'src/app/features/*/**', capture: ['feature'] },
      ],
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        message: '{{from.type}} must not import from {{to.type}} (modulith boundary).',
        policies: [
          { from: { element: { type: 'core' } }, allow: { to: { element: { type: 'core' } } } },
          { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
          {
            from: { element: { type: 'feature' } },
            allow: [
              { to: { element: { type: 'core' } } },
              { to: { element: { type: 'shared' } } },
              { to: { element: { type: 'feature', captured: { feature: '{{from.captured.feature}}' } } } },
            ],
          },
        ],
      }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
