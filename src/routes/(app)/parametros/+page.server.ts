import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { getValidationSchema } from '$lib/config';
import { arrayToSelectOptions } from '$lib/utils';
import { getDirectories } from '$lib/server/utils';
import { DEMPS_BASE_DIR } from '$env/static/private';

export const prerender = false;

export const load = (async () => {
	const availableDirectories = getDirectories(DEMPS_BASE_DIR) as string[];
	let baseDirSimOptions = arrayToSelectOptions(availableDirectories);

	// Swap indexes so '/home/demps-user/sim' is the first option
	const simIndex = baseDirSimOptions.findIndex((option) => option.value === '/home/demps-user/sim');

	if (simIndex !== -1) {
		const simOption = baseDirSimOptions.splice(simIndex, 1)[0];
		baseDirSimOptions = [simOption, ...baseDirSimOptions];
	}

	return { baseDirSimOptions };
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
	}
} satisfies Actions;
