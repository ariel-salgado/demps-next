import type { FetchDirectoryOptions } from '$lib/types';

import { fileURLToPath } from 'node:url';
import { dirname, extname, join } from 'node:path';
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rm,
	statSync,
	unlinkSync,
	writeFileSync
} from 'node:fs';

/**
 *
 * Returns the base path. In the container returns /home/demps-user/app.
 */
export const basePath = dirname(fileURLToPath(import.meta.url))
	.split('src')
	.at(0) as string;

/**
 *
 * @param path - Path to the directory.
 * @returns true if the path is a directory, otherwise return false.
 */
export function isDirectory(path: string): boolean {
	return existsSync(path) && statSync(path).isDirectory();
}

/**
 *
 * @param path - Path to the file.
 * @returns true if the path is a file, otherwise return false.
 */
export function isFile(path: string): boolean {
	return existsSync(path) && statSync(path).isFile();
}

/**
 *
 * @param path - Path to the file to read.
 * @returns A string with the file's content. If an error occurs while trying to read the file it will return null.
 */
export function readFile(path: string) {
	try {
		// ? Maybe change this implementation to the native read.
		// * Reference: https://kit.svelte.dev/docs/modules#$app-server-read

		return readFileSync(path, 'utf8');
	} catch {
		return null;
	}
}

/**
 *
 * @param path - Path to the directory.
 * @param options - Options to filter the returned data.
 * @returns An object with arrays of files and folders contained in the target path.
 */
export function readDirectory(
	path: string,
	options: FetchDirectoryOptions = { extensions: null, includeFiles: true, includeFolders: true }
): { files: string[]; folders: string[] } {
	if (!isDirectory(path)) {
		return { files: [], folders: [] };
	}

	const { extensions, includeFiles, includeFolders } = options;

	const files: string[] = [];
	const folders: string[] = [];

	const contents = readdirSync(path);

	for (const item of contents) {
		const fullPath = join(path, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory() && includeFolders) {
			folders.push(item);
		} else if (stat.isFile() && includeFiles) {
			if (
				!extensions ||
				extensions.length === 0 ||
				extensions.includes(extname(item).toLowerCase())
			) {
				files.push(item);
			}
		}
	}

	return { files, folders };
}

/**
 *
 * @param path Path to create
 * @returns If the directory already exists return void, otherwise, creates the directory and return true.
 */
export function createDirectory(path: string): true | void {
	return existsSync(path) || mkdirSync(path);
}

/**
 *
 * @param path - Path to the file to create.
 * @param fileName - Name of the file.
 * @param data - Content of the file to create.
 * @param force - If the file already exists, by default it doesn't create the file. If passed true, it deleted the file and create a new one.
 * @returns true if the file was created succesfully, otherwise it return false.
 */
export function createFile(path: string, fileName: string, data: string, force?: boolean) {
	if (!isDirectory(path)) {
		return false;
	}

	const fullPath = join(path, fileName);

	if (isFile(fullPath)) {
		if (!force) return false;

		const fileDeleted = deleteFile(fullPath);

		if (!fileDeleted) return false;
	}

	writeFileSync(fullPath, data, {
		encoding: 'utf8'
	});

	if (!isFile(fullPath)) {
		return false;
	}

	return true;
}

/**
 *
 * @param path - Path to directory to delete.
 * @returns true if the directory was deleted succesfully, otherwise it return false.
 */
export function deleteDirectory(path: string) {
	if (!isDirectory(path)) {
		return false;
	}

	rm(path, { recursive: true, force: false }, (error) => {
		if (error) {
			console.error(error);
			return false;
		}
	});

	return true;
}

/**
 *
 * @param path - Path to file to delete.
 * @returns true if the file was deleted succesfully, otherwise it return false.
 */
export function deleteFile(path: string) {
	if (!isFile(path)) {
		return false;
	}

	try {
		unlinkSync(path);
	} catch (error) {
		console.error(`Failed to delete existing file: ${error}`);
		return false;
	}

	return true;
}
