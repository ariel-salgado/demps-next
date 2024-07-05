import type { Actions } from '@sveltejs/kit';

import { getValidationSchema } from '$lib/config';

export const prerender = false;

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
	}
} satisfies Actions;
