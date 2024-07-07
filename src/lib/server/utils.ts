import { join } from 'node:path';
import { existsSync, mkdirSync, readdirSync, rm, statSync } from 'node:fs';

export function directoryExists(path: string) {
	return existsSync(path) && statSync(path).isDirectory();
}

export function getDirectories(path: string) {
	const folders: string[] = [];

	const files = readdirSync(path);
	for (const file of files) {
		const fullPath = join(path, file);
		if (directoryExists(fullPath)) {
			folders.push(fullPath);
		}
	}

	return folders;
}

export function getDirectoryTree(path: string) {
	const folders: string[] = [];

	function traverseDir(currentPath: string) {
		const files = readdirSync(currentPath);

		for (const file of files) {
			const fullPath = join(currentPath, file);
			if (directoryExists(fullPath)) {
				folders.push(fullPath);
				traverseDir(fullPath);
			}
		}
	}

	traverseDir(path);
	return folders;
}

export function createDirectory(path: string) {
	return existsSync(path) || mkdirSync(path);
}

export function deleteDirectory(path: string) {
	if (!directoryExists(path)) {
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
