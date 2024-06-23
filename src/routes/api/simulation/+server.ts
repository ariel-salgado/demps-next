import type { Watcher } from '$lib/server';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { DEMPS_SIM_DIR } from '$env/static/private';
import { createWatcher, createDempsProcess, createFileProcessor } from '$lib/server';

const fileWatchers: Watcher[] = [];

export const POST = (async () => {
	const dempsProcess = createDempsProcess();

	const dirWatcher = createWatcher('dirWatcher', DEMPS_SIM_DIR);
	fileWatchers.push(dirWatcher);

	return produce(
		async function start({ emit }) {
			const { error } = emit('status', 'running');

			if (error) {
				console.error(error);
				return;
			}

			dirWatcher.on('ready', async () => {
				try {
					await dempsProcess.run();
					return;
				} catch {
					return;
				}
			});

			dirWatcher.on('addDir', (path) => {
				if (path.includes('agents')) {
					const fileProcessor = createFileProcessor((data) => {
						emit('agents', data);
					});

					const fileWatcher = createWatcher('fileWatcher', path);
					fileWatchers.push(fileWatcher);

					fileWatcher.on('ready', () => {
						emit('ready', 'success');
					});

					fileWatcher.on('add', async (path) => {
						fileProcessor.push(path);
						await fileProcessor.process();
					});
				}
			});
		},
		{
			ping: 10000,
			async stop() {
				fileWatchers.forEach((watcher) => watcher.close());
				if (dempsProcess.isRunning) {
					await dempsProcess.abort();
				}

				console.log('Connection closed');
			}
		}
	);
}) satisfies RequestHandler;
