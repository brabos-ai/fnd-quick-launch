import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
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
