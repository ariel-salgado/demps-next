import type { FSWatcher } from 'chokidar';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { DEMPS_OUTPUT_DIR } from '$env/static/private';
import { uniquePool, createWatcher } from '$lib/server';

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

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
				const data: string[] = [];

				const readInterface = createInterface({
					input: createReadStream(path)
				});

				readInterface.on('line', (line) => {
					if (line.length > 0) {
						data.push(line);
					}
				});

				readInterface.on('close', () => {
					emit('message', data.toString());
				});
			});
		} catch {
			watcher.close();
		}
	});
}) satisfies RequestHandler;
