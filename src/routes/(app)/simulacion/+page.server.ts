import type { Actions } from './$types';
import type { FSWatcher } from 'chokidar';

import { DEMPS_OUTPUT_DIR } from '$env/static/private';
import { uniquePool, createWatcher } from '$lib/server';

export const prerender = false;

export const actions = {
	start: async () => {
		const watcher = createWatcher(DEMPS_OUTPUT_DIR);

		try {
			if (uniquePool.has('watcher')) {
				const oldWatcher = uniquePool.pop<FSWatcher>('watcher');
				oldWatcher!.close();
			}

			uniquePool.add('watcher', watcher);

			watcher.on('add', (path) => {
				console.log('File', path, 'has been added');
			});
		} catch {
			watcher.close();
		}
	},
	stop: async () => {
		if (uniquePool.has('watcher')) {
			const watcher = uniquePool.pop<FSWatcher>('watcher');
			watcher!.close();
		}
	}
} satisfies Actions;
