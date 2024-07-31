import type { RequestHandler } from './$types';
import type { SimulatorDirectives } from '$lib/types';
import type { DempsProcess, Watcher } from '$lib/server';

import { join } from 'node:path';
import { produce } from 'sveltekit-sse';
import { PUBLIC_SIM_DIR } from '$env/static/public';
import { basePath, isFile, readFile } from '$lib/server/utils';
import { createWatcher, createDempsProcess, createFileProcessor } from '$lib/server';

const fileWatchers: Watcher[] = [];
const childProcesses: DempsProcess[] = [];

export const POST = (async () => {
	return produce(
		async function start({ emit }) {
			const { error } = emit('status', 'init');

			if (error) {
				console.error(error);
				return;
			}

			const directives = getSimulationDirectives();

			if (!directives) {
				emit('status', 'error');
				return;
			}

			const { configFile, agentsDir, floodEnabled, floodDir } = directives;

			const dempsProcess = createDempsProcess(PUBLIC_SIM_DIR, configFile);
			childProcesses.push(dempsProcess);

			const agentWatcher = createWatcher('agentWatcher', agentsDir);
			fileWatchers.push(agentWatcher);

			agentWatcher.on('ready', async () => {
				emit('status', 'ready');

				try {
					await dempsProcess.run();
					emit('status', 'finished');
				} catch (error) {
					console.error(error);
					console.log('Closing the connection.');
					emit('status', 'error');
				} finally {
					// eslint-disable-next-line no-unsafe-finally
					return;
				}
			});

			const agentProcessor = createFileProcessor(
				(line, isFirstLine) => processAgentData(line, isFirstLine),
				(data) => emit('agents', data)
			);

			agentWatcher.on('add', (path) => {
				agentProcessor.push(path);
			});

			/* if (floodEnabled) {
				const floodWatcher = createWatcher('floodWatcher', floodDir);
				fileWatchers.push(floodWatcher);

				// TODO: Make data process generic passing a callback function
				const floodProcessor = createFileProcessor((data) => {
					emit('agents', data);
				});

				floodWatcher.on('add', (path) => {
					floodProcessor.push(path);
				});
			} */
		},
		{
			ping: 10000,
			async stop() {
				fileWatchers.forEach((watcher) => watcher.close());
				childProcesses.forEach(async (childProcess) => {
					if (childProcess.isRunning) {
						await childProcess.kill();
					}
				});

				console.log('Connection closed');
			}
		}
	);
}) satisfies RequestHandler;

function processAgentData(line: string, isFirstLine: boolean) {
	if (!isFirstLine) {
		const splitted = line.split(' ');

		const lat = splitted.at(1);
		const lng = splitted.at(2);

		if (lat && lng) {
			return lat + ',' + lng + '$';
		}
	}
}

function getSimulationDirectives() {
	const iniFilePath = join(basePath, 'sim.ini');

	if (!isFile(iniFilePath)) {
		return null;
	}

	try {
		const data = readFile(iniFilePath);

		const directives = {} as SimulatorDirectives;

		for (const line of data!.split('\n')) {
			const trimmedLine = line.trim();
			if (trimmedLine) {
				const [key, value] = trimmedLine.split('=');

				if (key && value) {
					// @ts-expect-error - key.trim() is a key of SimulatorDirectives
					directives[key.trim()] = value.trim();
				}
			}
		}

		return directives;
	} catch {
		return null;
	}
}
