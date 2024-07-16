import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { isDirectory, getDirectoryContents } from '$lib/server/utils';

export const POST = (async ({ request }) => {
	const { path, options } = await request.json();

	if (!path) {
		return json({
			error: {
				code: 400,
				message: 'No se ha proporcionado un directorio.'
			}
		});
	}

	if (!isDirectory(path)) {
		return json({
			error: {
				code: 404,
				message: 'El directorio proporcionado no existe.'
			}
		});
	}

	return json({
		contents: getDirectoryContents(path, { ...options, includeFolders: true })
	});
}) satisfies RequestHandler;
