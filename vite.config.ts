import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	test: {
		globals: true,
		include: ['test/**/*.{test,spec}.{js,ts}'],
		alias: {
			$lib: resolve('./src/lib')
		}
	},
	css: {
		transformer: 'lightningcss'
	}
});
