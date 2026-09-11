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
  // Modulith-Grenzen (angular-modulith-bridge): core/ und shared/ importieren
  // nie aus features/; Cross-Feature-Imports sind verboten, unabhaengig davon,
  // ob zwei Features derselben Abteilung angehoeren oder nicht (die
  // Abteilungsebene ist reine Navigationshilfe, keine technische Grenze).
  // eslint-plugin-boundaries statt no-restricted-imports, weil es tatsaechliche
  // Dateipfade aufloest - no-restricted-imports erkannte relative Importe
  // (statt @alias/...) bisher gar nicht.
  {
    files: ['src/app/**/*.ts'],
    plugins: { boundaries },
    settings: {
      // eslint-plugin-boundaries loest Importe ueber 'import/resolver' auf -
      // ohne den TypeScript-Resolver bleiben die @core/@shared/@features-
      // Alias-Importe fuer boundaries unbekannte externe Module, und keine
      // Grenzregel greift jemals (stiller False-Negative, siehe Commit-Historie).
      'import/resolver': {
        typescript: { project: path.join(__dirname, 'tsconfig.json') },
      },
      'boundaries/include': ['src/app/**/*.ts'],
      'boundaries/elements': [
        { type: 'core', pattern: 'src/app/core/**' },
        { type: 'shared', pattern: 'src/app/shared/**' },
        // login/home/countdown-embed/not-found liegen direkt unter features/,
        // ohne Abteilungs-Unterordner (siehe angular-modulith-bridge, BAR-Beispiel) -
        // jede davon zaehlt als ein eigenstaendiges "Feature ohne Abteilung".
        {
          type: 'standalone-feature',
          pattern: 'src/app/features/{login,home,countdown-embed,not-found}/**',
          capture: ['feature'],
        },
        // Eine Datei direkt unter features/<Abteilung>/ (kein weiterer
        // Unterordner) ist Abteilungs-weites, aber fachbereichs-internes
        // Gemeingut - z.B. features/anmeldung/master-data-api.service.ts,
        // geteilt von my-articles/ und articles/, ohne dass die beiden
        // sich gegenseitig importieren.
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
        message: '{{from.type}} darf nicht aus {{to.type}} importieren (Modulith-Grenze, siehe angular-modulith-bridge).',
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
