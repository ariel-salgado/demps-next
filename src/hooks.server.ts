import type { Handle } from '@sveltejs/kit';
import type { Options } from 'html-minifier-terser';

import { building } from '$app/environment';
import { minify } from 'html-minifier-terser';

const options: Options = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	conservativeCollapse: true,
	decodeEntities: true,
	html5: true,
	ignoreCustomComments: [/^#/],
	minifyCSS: true,
	minifyJS: false,
	removeAttributeQuotes: true,
	removeComments: false,
	removeOptionalTags: true,
	removeRedundantAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	sortAttributes: true,
	sortClassName: true
};

export const handle = (async ({ event, resolve }) => {
	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done) return building ? minify(html, options) : html;
		}
	});
}) satisfies Handle;
