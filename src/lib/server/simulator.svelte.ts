import type { DempsProcess } from '.';
import type { ChildProcess } from 'child_process';

import { join } from 'node:path';
import { execFile } from 'child_process';
import { uniquePool } from '$lib/states';
import { isDirectory } from './utils';
import { DEMPS_SIM_DIR } from '$env/static/private';

import treeKill from 'tree-kill';

export function createDempsProcess() {
	let isRunning: boolean = $state(false);
	let dempsProcess: ChildProcess | undefined = $state();

	killExistingProcess();

	async function run(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!isDirectory(DEMPS_SIM_DIR)) {
				reject(new Error('Simulator directory does not exist'));
			}

			try {
				dempsProcess = execFile(
					'./run.sh',
					['--config', 'vdm-pob-vergara.config', '--outdir', 'output/vdm-pob-vergara'],
					{ cwd: DEMPS_SIM_DIR },
					(error) => {
						if (error && error.code === 'ENOENT') {
							console.error(`File not found: ${join(DEMPS_SIM_DIR, './run.sh')}.`);
							reject(error);
						}
					}
				);

				dempsProcess.on('spawn', () => {
					isRunning = true;
					uniquePool.add('dempsProcess', dempsProcess);
				});

				dempsProcess.on('error', async (error) => {
					console.error('Error starting the process.');
					await kill();
					reject(error);
				});

				dempsProcess.on('exit', (code, signal) => {
					if (code === 0) {
						resolve();
					}

					reject(new Error(`Process exited with code ${code} and signal ${signal}`));
				});

				dempsProcess.on('close', async () => await kill());
			} catch (error) {
				reject(error);
			}
		});
	}

	async function kill(signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
		if (!dempsProcess || dempsProcess.killed) {
			console.log('Process was already killed or does not exist');
			return;
		}

		console.log(`Shutting down gracefully with signal ${signal}...`);

		return new Promise((resolve, reject) => {
			if (dempsProcess?.pid) {
				treeKill(dempsProcess?.pid, signal, (err) => {
					if (err) {
						reject(err);
					} else {
						console.log('Process killed successfully');
						cleanup();
						resolve();
					}
				});
			} else {
				console.log('No PID found, killing process directly');
				cleanup();
				resolve();
			}
		});
	}

	function cleanup() {
		killExistingProcess();
		isRunning = false;
		dempsProcess = undefined;
	}

	function killExistingProcess() {
		if (uniquePool.has('dempsProcess')) {
			const current = uniquePool.pop<DempsProcess>('dempsProcess');
			if (current && current.isRunning) {
				current.kill();
			}
		}
	}

	return {
		run,
		kill,
		get isRunning() {
			return isRunning;
		}
	};
}
