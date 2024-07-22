import type { Actions } from '@sveltejs/kit';

import { getValidationSchema } from '$lib/utils';
import { parametersFormFields } from '$lib/config';

export const prerender = false;

// TODO: Remove duplicates, better handling on client-side code
export const actions = {
	download: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const schema = getValidationSchema(parametersFormFields);

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

		const schema = getValidationSchema(parametersFormFields);

		const result = schema.safeParse(formData);

		if (!result.success) {
			return {
				errors: result.error.flatten().fieldErrors
			};
		}

		return formData;
	}
} satisfies Actions;
