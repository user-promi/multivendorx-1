import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import wordpressPlugin from '@wordpress/eslint-plugin';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default defineConfig([
	{
		ignores: [
			'assets/',
			'.cache/',
			'vendor/',
			'templates/',
			'classes/',
			'node_modules/',
			'*.config.js',
			'webpack.config.js',
		],
	},

	{
		files: ['**/*.{js,jsx,ts,tsx,mjs}'],

		languageOptions: {
			...js.configs.recommended.languageOptions,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: 'module',
				ecmaFeatures: { jsx: true },
			},
			globals: {
				...globals.browser,
				...globals.node,
				wp: 'readonly',
				wpApiSettings: 'readonly',
				wcSettings: 'readonly',
			},
		},

		plugins: {
			'@wordpress': wordpressPlugin,
			prettier: prettierPlugin,
		},

		rules: {
			...js.configs.recommended.rules,
			...wordpressPlugin.configs.recommended.rules,
		},
	},
]);
