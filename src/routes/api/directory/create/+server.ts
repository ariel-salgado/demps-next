import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { createDirectory, isDirectory } from '$lib/server/utils';

export const POST = (async ({ request }) => {
	const { path } = await request.json();

	if (!path) {
		return json({
			error: {
				code: 400,
				message: 'No se ha proporcionado un directorio.'
			}
		});
	}

	if (isDirectory(path)) {
		return json({
			error: {
				code: 400,
				message: 'El directorio proporcionado ya existe.'
			}
		});
	}

	createDirectory(path);

	return json({
		created: path
	});
}) satisfies RequestHandler;
