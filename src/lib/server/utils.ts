import type { FetchDirectoryOptions } from '$lib/types';

import { extname, join } from 'node:path';
import { existsSync, mkdirSync, readdirSync, rm, statSync } from 'node:fs';

export function isDirectory(path: string) {
	return existsSync(path) && statSync(path).isDirectory();
}

export function isFile(path: string) {
	return existsSync(path) && statSync(path).isFile();
}

export function getDirectoryContents(
	path: string,
	options: FetchDirectoryOptions = { extensions: null, includeFiles: true, includeFolders: true }
) {
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

export function createDirectory(path: string) {
	return existsSync(path) || mkdirSync(path);
}

export function deleteFile(path: string) {
	if (!isFile(path)) {
		return false;
	}

	rm(path, { recursive: false, force: false }, (error) => {
		if (error) {
			console.error(error);
			return false;
		}
	});

	return true;
}

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
