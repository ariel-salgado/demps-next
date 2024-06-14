import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	server: {
		host: '0.0.0.0'
	},
	test: {
		globals: true,
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
