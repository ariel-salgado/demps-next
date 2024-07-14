import type { RequestHandler } from './$types';

import { json } from '@sveltejs/kit';
import { deleteDirectory, deleteFile, isDirectory, isFile } from '$lib/server/utils';

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

	if (isFile(path)) {
		deleteFile(path);

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

/* deleteDirectory: async ({ request }) => {
	const formData = await request.formData();
	const toDelete = formData.get('delete') as string;

	if (!toDelete) {
		return { errorMessage: 'Error al enviar la información al servidor.' };
	}

	if (!isDirectory(toDelete)) {
		return { errorMessage: 'El directorio no existe.' };
	}

	const res = deleteDirectory(toDelete);

	if (!res) {
		return { errorMessage: 'Error al eliminar el directorio.' };
	}

	return { deleted: toDelete };
}; */
