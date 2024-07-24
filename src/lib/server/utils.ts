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
	writeFileSync
} from 'node:fs';

export const basePath = dirname(fileURLToPath(import.meta.url))
	.split('src')
	.at(0) as string;

export function isDirectory(path: string) {
	return existsSync(path) && statSync(path).isDirectory();
}

export function isFile(path: string) {
	return existsSync(path) && statSync(path).isFile();
}

export function readFile(path: string) {
	try {
		return readFileSync(path, 'utf8');
	} catch {
		return null;
	}
}

export function readDirectory(
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
