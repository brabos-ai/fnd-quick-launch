import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
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
    },
  },
])
