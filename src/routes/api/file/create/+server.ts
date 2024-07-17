import type { RequestHandler } from './$types';

import { join } from 'node:path';
import { json } from '@sveltejs/kit';
import { createFile, deleteFile, isDirectory, isFile } from '$lib/server/utils';

export const POST = (async ({ request }) => {
	const { data, fileName, path } = await request.json();

	if (!data || !fileName || !path) {
		return json({
			error: {
				code: 400,
				message: 'No se ha proporcionado la información necesaria para crear el archivo.'
			}
		});
	}

	if (!isDirectory(path)) {
		return json({
			error: {
				code: 404,
				message: 'La ruta proporcionada no existe.'
			}
		});
	}

	const fullPath = join(path, fileName);

	// Overwrite by default
	if (isFile(fullPath)) {
		deleteFile(fullPath);
	}

	const response = createFile(path, fileName, data);

	if (!response) {
		return json({
			error: {
				code: 500,
				message: 'No se ha podido crear el archivo.'
			}
		});
	}

	return json({ path, fileName });
}) satisfies RequestHandler;
