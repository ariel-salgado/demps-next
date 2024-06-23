import type { FSWatcher } from 'chokidar';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { uniquePool } from '$lib/states';
import { DEMPS_SIM_DIR } from '$env/static/private';
import { createWatcher, runDempsSim, createFileProcessor } from '$lib/server';

export const POST = (async () => {
	const dirWatcher = createWatcher(DEMPS_SIM_DIR);

	if (uniquePool.has('dirWatcher')) {
		uniquePool.pop<FSWatcher>('dirWatcher')?.close();
	}

	uniquePool.add('dirWatcher', dirWatcher);

	return produce(
		async function start({ emit }) {
			const { error } = emit('initConnection', 'success');

			if (error) {
				console.error(error);
				return;
			}

			dirWatcher.on('ready', async () => {
				try {
					await runDempsSim();
					return;
				} catch {
					console.error('Error running simulation');
					return;
				}
			});

			dirWatcher.on('addDir', (path) => {
				if (path.includes('agents')) {
					const fileWatcher = createWatcher(path);

					if (uniquePool.has('fileWatcher')) {
						uniquePool.pop<FSWatcher>('fileWatcher')?.close();
					}

					uniquePool.add('fileWatcher', fileWatcher);

					const fileProcessor = createFileProcessor((data) => {
						emit('agents', data);
					});

					fileWatcher.on('add', async (path) => {
						fileProcessor.push(path);
						await fileProcessor.process();
					});
				}
			});
		},
		{
			async stop() {
				if (uniquePool.has('dirWatcher')) {
					uniquePool.pop<FSWatcher>('dirWatcher')?.close();
				}

				console.log('Connection closed');
			}
		}
	);
}) satisfies RequestHandler;
