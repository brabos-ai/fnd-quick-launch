import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    // Ignora arquivos de configuração (vite, vitest, etc) - não precisam de type-aware linting
    ignores: ['**/*.config.{js,ts,mjs,mts}', '**/vite.config.*', '**/vitest.config.*'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: './tsconfig.app.json',
      },
    },
    rules: {
      // === Regras de importação (críticas) ===
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@fnd/contracts', '@fnd/contracts/*'],
              message: 'Frontend apps should not import from @fnd/contracts (backend-only)',
            },
            {
              group: ['@fnd/database', '@fnd/database/*'],
              message: 'Frontend apps should not import from @fnd/database (backend-only)',
            },
          ],
        },
      ],

      // === TypeScript - Regras relaxadas (pragmáticas) ===
      // any: warn ao invés de error - útil para catch blocks, libs sem tipos, prototipação
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused vars é erro, mas _ escapa (convenção para ignorar intencionalmente)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Permite @ts-ignore com comentário explicativo
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-ignore': 'allow-with-description',
        'ts-expect-error': 'allow-with-description',
        minimumDescriptionLength: 3,
      }],
      // Non-null assertion (!) - warn, às vezes necessário
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Empty functions - comum em defaults, mocks, placeholders
      '@typescript-eslint/no-empty-function': 'off',
      // Require sem await - comum em fire-and-forget
      '@typescript-eslint/no-floating-promises': 'off',
      // Empty interfaces - útil para extensibilidade futura
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',

      // === JavaScript - Regras relaxadas ===
      // Console - permite error/warn (útil para debug), bloqueia log/debug
      'no-console': ['error', { allow: ['error', 'warn'] }],
      // Prefer const - warn, não crítico
      'prefer-const': 'warn',
      // Empty catch - às vezes intencional
      'no-empty': ['warn', { allowEmptyCatch: true }],
    },
  },
])
