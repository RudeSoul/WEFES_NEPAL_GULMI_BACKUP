import js from '@eslint/js';
import tsPlugin from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tsPlugin.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/public/**',
      'data/**',
      '*.geojson',
      '*.tif',
      '*.nc',
      '.githooks/**',
    ],
  },
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  prettierConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  }
);
