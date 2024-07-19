import type { PageServerLoad } from './$types';

import { DEMPS_BASE_DIR } from '$env/static/private';

export const prerender = false;

export const load = (async () => {
	return { baseDir: DEMPS_BASE_DIR };
}) satisfies PageServerLoad;
