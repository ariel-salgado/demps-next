import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		hmr: true,
		host: '0.0.0.0'
	},
	build: {
		cssMinify: 'lightningcss'
	},
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
