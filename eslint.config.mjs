import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**'],
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'prettier'],
    rules: {
      // Allow unescaped French apostrophes in JSX text content
      'react/no-unescaped-entities': 'off',
    },
  }),
]

export default eslintConfig