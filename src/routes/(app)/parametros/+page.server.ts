import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { getValidationSchema } from '$lib/config';
import { DEMPS_BASE_DIR } from '$env/static/private';

export const prerender = false;

export const load = (async () => {
	return { baseDir: DEMPS_BASE_DIR };
}) satisfies PageServerLoad;

export const actions = {
	download: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const schema = getValidationSchema();

		const result = schema.safeParse(formData);

		if (!result.success) {
			return {
				errors: result.error.flatten().fieldErrors
			};
		}

		return formData;
	},
	verify: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const schema = getValidationSchema();

		const result = schema.safeParse(formData);

		if (!result.success) {
			return {
				errors: result.error.flatten().fieldErrors
			};
		}

		return formData;
	}
} satisfies Actions;
