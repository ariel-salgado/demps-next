import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { deleteDirectory, isDirectory } from '$lib/server/utils';

export const DELETE = (async ({ request }) => {
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
		deleteDirectory(path);

		return json({
			deleted: path
		});
	}

	return json({
		error: {
			code: 404,
			message: 'El directorio no existe.'
		}
	});
}) satisfies RequestHandler;
