import { join } from 'node:path';
import { existsSync, readdirSync, statSync } from 'node:fs';

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
