import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			precompress: true,
			strict: true
		})
	},
	compilerOptions: {
		modernAst: true
	}
};

export default config;
