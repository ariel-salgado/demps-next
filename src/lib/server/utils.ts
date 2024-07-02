import { existsSync, statSync } from 'node:fs';

export function directoryExists(path: string) {
	return existsSync(path) && statSync(path).isDirectory();
}
