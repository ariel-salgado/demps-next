import type { FSWatcher } from 'chokidar';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { DEMPS_OUTPUT_DIR } from '$env/static/private';
import { uniquePool, createWatcher } from '$lib/server';

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export const POST = (async () => {
	const watcher = createWatcher(DEMPS_OUTPUT_DIR);

	if (uniquePool.has('watcher')) {
		uniquePool.pop<FSWatcher>('watcher')?.close();
	}

	uniquePool.add('watcher', watcher);

	return produce(
		async function start({ emit }) {
			const { error } = emit('initConnection', 'success');

			if (error) {
				console.error(error);
				return;
			}

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
					emit('agentsCoordinates', data.toString());
				});
			});
		},
		{
			async stop() {
				console.log('Connection closed');
			}
		}
	);
}) satisfies RequestHandler;
