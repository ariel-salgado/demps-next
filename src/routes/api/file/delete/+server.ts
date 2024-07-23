import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { deleteFile, isFile } from '$lib/server/utils';

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

	if (isFile(path)) {
		deleteFile(path);

		return json({
			deleted: path
		});
	}

	return json({
		error: {
			code: 404,
			message: 'El archivo no existe.'
		}
	});
}) satisfies RequestHandler;
