import type { FSWatcher } from 'chokidar';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { DEMPS_OUTPUT_DIR } from '$env/static/private';
import { uniquePool, createWatcher } from '$lib/server';

export const POST = (async () => {
	return produce(async function start({ emit }) {
		const watcher = createWatcher(DEMPS_OUTPUT_DIR);

		try {
			if (uniquePool.has('watcher')) {
				const oldWatcher = uniquePool.pop<FSWatcher>('watcher');
				oldWatcher!.close();
			}

			uniquePool.add('watcher', watcher);

			watcher.on('add', async (path) => {
				emit('message', `${path}`);
			});
		} catch {
			watcher.close();
		}
	});
}) satisfies RequestHandler;
