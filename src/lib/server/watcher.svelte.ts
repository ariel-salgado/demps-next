import type { FSWatcher } from 'chokidar';

import { watch } from 'chokidar';
import { uniquePool } from '$lib/states';

export function createWatcher(id: string, path: string) {
	const watcher = $state(
		watch(path, {
			ignoreInitial: true,
			usePolling: true
		})
	);

	if (uniquePool.has(id)) {
		uniquePool.pop<FSWatcher>(id)?.close();
	}

	uniquePool.add(id, watcher);

	return watcher;
}
