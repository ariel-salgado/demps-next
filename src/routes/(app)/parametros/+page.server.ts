import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { join } from 'node:path';
import { getValidationSchema } from '$lib/utils';
import { PUBLIC_SIM_DIR } from '$env/static/public';
import { createFile, isFile } from '$lib/server/utils';
import { defaultZonesFilename, parametersFormFields } from '$lib/config';

export const prerender = false;

export const load = (async () => {
	const path: string = join(PUBLIC_SIM_DIR, 'input/');

	if (isFile(join(path, defaultZonesFilename))) return;

	const defaultData: string = JSON.stringify(
		{
			type: 'FeatureCollection',
			features: []
		},
		null,
		'\t'
	);

	createFile(path, defaultZonesFilename, defaultData);
}) satisfies PageServerLoad;

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
