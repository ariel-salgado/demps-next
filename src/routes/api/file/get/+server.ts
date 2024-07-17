import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { isFile, readFile } from '$lib/server/utils';

export const POST = (async ({ request }) => {
	let { path } = await request.json();

	path = (path as string).endsWith('/') ? path.slice(0, -1) : path;

	if (!path) {
		return json({
			error: {
				code: 400,
				message: 'No se ha proporcionado un directorio.'
			}
		});
	}

	if (!isFile(path)) {
		return json({
			error: {
				code: 404,
				message: 'El archivo proporcionado no existe.'
			}
		});
	}

	return json({
		data: readFile(path)
	});
}) satisfies RequestHandler;
