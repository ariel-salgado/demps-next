import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { joinPath } from '$lib/utils';
import { getValidationSchema } from '$lib/config';
import { DEMPS_BASE_DIR } from '$env/static/private';
import {
	createDirectory,
	deleteDirectory,
	directoryExists,
	getDirectories
} from '$lib/server/utils';

export const prerender = false;

export const load = (async () => {
	return { baseDir: DEMPS_BASE_DIR, directoryTree: getDirectories(DEMPS_BASE_DIR) };
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
	},
	getDirectories: async ({ request }) => {
		const formData = await request.formData();
		const directory = formData.get('directory') as string;

		if (!directory) {
			return { errorMessage: 'Error al enviar la información al servidor.' };
		}

		if (!directoryExists(directory)) {
			return { errorMessage: 'El directorio no existe.' };
		}

		return { currentDirectory: directory, directoryTree: getDirectories(directory) };
	},
	createDirectory: async ({ request }) => {
		const formData = await request.formData();
		const directory = formData.get('directory') as string;
		const currentDirectory = formData.get('currentDirectory') as string;

		if (!directory || !currentDirectory) {
			return { errorMessage: 'Error al enviar la información al servidor.' };
		}

		const newDirectory = joinPath(currentDirectory, directory);

		if (directoryExists(newDirectory)) {
			return { errorMessage: 'El directorio ya existe.' };
		}

		createDirectory(newDirectory);

		return { directoryTree: getDirectories(currentDirectory) };
	},
	deleteDirectory: async ({ request }) => {
		const formData = await request.formData();
		const toDelete = formData.get('delete') as string;

		if (!toDelete) {
			return { errorMessage: 'Error al enviar la información al servidor.' };
		}

		if (!directoryExists(toDelete)) {
			return { errorMessage: 'El directorio no existe.' };
		}

		const res = deleteDirectory(toDelete);

		if (!res) {
			return { errorMessage: 'Error al eliminar el directorio.' };
		}

		return { deleted: toDelete };
	}
} satisfies Actions;
