import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const languageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: {
    ...globals.browser,
    ...globals.node,
    __APP_ENV__: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
};

const plugins = {
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
  'jsx-a11y': jsxA11yPlugin,
};

const sharedRules = {
  ...js.configs.recommended.rules,
  ...reactPlugin.configs.recommended.rules,
  ...jsxA11yPlugin.configs.recommended.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  ...prettierConfig.rules,
  'react/react-in-jsx-scope': 'off',
  'react-hooks/exhaustive-deps': 'warn',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
};

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', 'pnpm-lock.yaml'],
  },

  // ── JavaScript / JSX ────────────────────────────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    languageOptions,
    plugins,
    rules: {
      ...sharedRules,
      'react/prop-types': 'warn',
      'no-unused-vars': 'warn',
    },
    settings: {
      react: {
        version: '19.3',
      },
    },
  },

  // ── TypeScript / TSX ────────────────────────────────────────────────
  {
    files: ['**/*.{ts,tsx}'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      ...languageOptions,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins,
    rules: {
      ...sharedRules,
      // TypeScript ya valida las props, los tipos y las variables sin uso.
      'react/prop-types': 'off',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Permite `interface DefaultTheme extends Theme {}` para augmentar styled-components.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
    },
    settings: {
      react: {
        version: '19.3',
      },
    },
  },
);
