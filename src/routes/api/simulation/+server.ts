import type { FSWatcher } from 'chokidar';
import type { RequestHandler } from './$types';

import { produce } from 'sveltekit-sse';
import { DEMPS_SIM_DIR } from '$env/static/private';
import { uniquePool, createWatcher, runDempsSim } from '$lib/server';

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

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

					fileWatcher.on('add', async (path) => {
						try {
							const data: { lat: string; lng: string }[] = [];

							const readInterface = createInterface({
								input: createReadStream(path),
								terminal: false
							});

							readInterface.on('line', (line) => {
								if (line.length > 0) {
									const parsedLine = line.split(' ');
									const lat = parsedLine[1];
									const lng = parsedLine[2];

									if (lat && lng) {
										data.push({ lat, lng });
									}
								}
							});

							readInterface.on('close', () => {
								const dataString = data.map((item) => `${item.lat}, ${item.lng}`).join('\n');
								emit('agentsCoordinates', dataString);
							});
						} catch (error) {
							console.error(`Error reading file ${path}:`, error);
						}
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
