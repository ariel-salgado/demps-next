import { watch } from 'chokidar';

export function createWatcher(path: string) {
	const watcher = $state(
		watch(path, {
			ignoreInitial: true
		})
	);

	return watcher;
}
