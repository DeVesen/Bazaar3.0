// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const boundaries = require('eslint-plugin-boundaries');
const path = require('node:path');

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
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  // Modulith boundaries (angular-modulith-bridge): core/ and shared/ never
  // import from features/; cross-feature imports are forbidden, regardless
  // of whether two features belong to the same department or not (the
  // department level is pure navigation aid, not a technical boundary).
  // eslint-plugin-boundaries instead of no-restricted-imports, because it
  // resolves actual file paths - no-restricted-imports never recognized
  // relative imports (as opposed to @alias/...) at all.
  {
    files: ['src/app/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // eslint-plugin-boundaries resolves imports via 'import/resolver' -
      // without the TypeScript resolver, the @core/@shared/@features alias
      // imports remain unknown external modules to boundaries, and no
      // boundary rule ever fires (a silent false negative, see commit history).
      'import/resolver': {
        typescript: { project: path.join(__dirname, 'tsconfig.json') },
      },
      'boundaries/include': ['src/app/**/*.ts'],
      'boundaries/elements': [
        { type: 'core', pattern: 'src/app/core/**' },
        { type: 'shared', pattern: 'src/app/shared/**' },
        // login/home/countdown-embed/not-found live directly under features/,
        // without a department subfolder (see angular-modulith-bridge, BAR
        // example) - each counts as its own "feature without a department".
        {
          type: 'standalone-feature',
          pattern: 'src/app/features/{login,home,countdown-embed,not-found}/**',
          capture: ['feature'],
        },
        // A file directly under features/<department>/ (no further
        // subfolder) is department-wide but internal common ground - e.g.
        // features/registration/master-data-api.service.ts, shared by
        // my-articles/ and articles/ without the two importing each other.
        {
          type: 'department-shared',
          pattern: 'src/app/features/*/*.ts',
          mode: 'file',
          capture: ['department'],
        },
        {
          type: 'feature',
          pattern: 'src/app/features/*/*/**',
          capture: ['department', 'feature'],
        },
      ],
    },
    rules: {
      'boundaries/dependencies': ['error', {
        default: 'disallow',
        message: '{{from.type}} must not import from {{to.type}} (modulith boundary, see angular-modulith-bridge).',
        policies: [
          { from: { element: { type: 'core' } }, allow: { to: { element: { type: 'core' } } } },
          { from: { element: { type: 'shared' } }, allow: { to: { element: { type: 'shared' } } } },
          {
            from: { element: { type: 'standalone-feature' } },
            allow: [
              { to: { element: { type: 'core' } } },
              { to: { element: { type: 'shared' } } },
              { to: { element: { type: 'standalone-feature', captured: { feature: '{{from.captured.feature}}' } } } },
            ],
          },
          {
            from: { element: { type: 'department-shared' } },
            allow: [
              { to: { element: { type: 'core' } } },
              { to: { element: { type: 'shared' } } },
              { to: { element: { type: 'department-shared', captured: { department: '{{from.captured.department}}' } } } },
            ],
          },
          {
            from: { element: { type: 'feature' } },
            allow: [
              { to: { element: { type: 'core' } } },
              { to: { element: { type: 'shared' } } },
              { to: { element: { type: 'department-shared', captured: { department: '{{from.captured.department}}' } } } },
              {
                to: {
                  element: {
                    type: 'feature',
                    captured: { department: '{{from.captured.department}}', feature: '{{from.captured.feature}}' },
                  },
                },
              },
            ],
          },
        ],
      }],
    },
  },
]);
