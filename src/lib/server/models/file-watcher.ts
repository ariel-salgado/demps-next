import type { WatchOptions } from 'chokidar';

import { FSWatcher } from 'chokidar';
import { SvelteMap } from 'svelte/reactivity';

const watchers: SvelteMap<string, FSWatcher> = new SvelteMap();

process.on('exit', () => {
	for (const watcher of watchers.values()) {
		watcher.close();
	}
	watchers.clear();
});

export class FileWatcher extends FSWatcher {
	constructor(id: string, path?: string, options?: WatchOptions) {
		super({
			persistent: true,
			ignoreInitial: true,
			usePolling: true,
			...options
		});

		if (path) {
			super.add(path);
		}

		this.terminate_stored_watcher(id);

		watchers.set(id, this);
	}

	private terminate_stored_watcher(id: string) {
		if (watchers.has(id)) {
			let stored_watcher: FSWatcher | null = watchers.get(id)!;
			stored_watcher?.close();
			stored_watcher = null;
			watchers.delete(id);
		}
	}
}
