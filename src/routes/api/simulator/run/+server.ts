import type { RequestHandler } from './$types';
import type { SimulatorDirectives } from '$lib/types';

import { join } from 'node:path';
import { basePath, isFile, readFile } from '$lib/server/utils';
import { PUBLIC_EXEC_CMD, PUBLIC_SIM_DIR } from '$env/static/public';

import { Stream } from '$lib/models';
import { FileWatcher, Process } from '$lib/server/models';
import { create_agent_processor, create_flood_processor } from '$lib/server/helpers';

let stream: Stream;
let demps_process: Process;

export const DELETE = (async () => {
	stream.close();
	if (demps_process && demps_process.is_running) {
		console.log('Stopping current simulation');
		demps_process.kill();

		if (demps_process.is_running) {
			console.log('Force killing simulation');
			demps_process.force_kill();
		}
	}

	return new Response();
}) satisfies RequestHandler;

export const GET = (async () => {
	console.log('Connection started');

	stream = new Stream();

	const directives = getSimulationDirectives();

	if (!directives) {
		stream.send({ name: 'status', data: 'error' });
		stream.close();
	} else {
		stream.send({ name: 'status', data: 'init' });
	}

	const { configFile, agentsDir, floodEnabled, floodDir } = directives!;

	const agent_watcher = new FileWatcher('agent_watcher');
	const flood_watcher = new FileWatcher('flood_watcher');

	demps_process = new Process('demps', PUBLIC_EXEC_CMD, ['--config', configFile], {
		cwd: PUBLIC_SIM_DIR
	});

	const agent_processor = create_agent_processor((data) => {
		stream.sync_and_send({ name: 'agents', data: data });
	});

	const flood_processor = create_flood_processor((data) => {
		stream.sync_and_send({ name: 'flood', data: data });
	});

	demps_process.on_spawn(() => {
		agent_watcher.add(agentsDir);
		flood_watcher.add(floodDir);
		stream.send({ name: 'status', data: 'ready' });
	});

	agent_watcher.on('add', (path) => {
		agent_processor.add(path);
	});

	if (floodEnabled) {
		flood_watcher.on('add', (path) => {
			flood_processor.add(path);
		});
	}

	demps_process.on_close((code) => {
		console.log('DEMPS closed');

		if (code === 0) {
			stream.send({ name: 'status', data: 'finished' });
		} else {
			stream.send({ name: 'status', data: 'error' });
		}
		stream.close();
	});

	stream.on_close(() => {
		demps_process?.kill();
		agent_watcher.close();
		agent_processor.close();
		flood_watcher.close();
		flood_processor.close();

		console.log('Connection closed');
	});

	return stream.response();
}) satisfies RequestHandler;

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

		directives.floodEnabled = Boolean(directives.floodEnabled);

		return directives;
	} catch {
		return null;
	}
}
