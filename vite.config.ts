import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		hmr: false,
		host: '0.0.0.0'
	},
	build: {
		cssMinify: 'lightningcss'
	},
	test: {
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
