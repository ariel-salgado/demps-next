import type { DempsProcess } from '.';
import type { ChildProcess } from 'child_process';

import { join } from 'node:path';
import { isDirectory } from './utils';
import { execFile } from 'child_process';
import { uniquePool } from '$lib/states';
import { PUBLIC_EXEC_CMD } from '$env/static/public';

import treeKill from 'tree-kill';

export function createDempsProcess(path: string, filename: string) {
	let isRunning: boolean = $state(false);
	let dempsProcess: ChildProcess | undefined = $state();

	killExistingProcess();

	async function run(onStart?: () => void): Promise<void> {
		return new Promise((resolve, reject) => {
			if (!isDirectory(path)) {
				reject(new Error('Simulator directory does not exist'));
			}

			try {
				dempsProcess = execFile(PUBLIC_EXEC_CMD, ['--config', filename], { cwd: path }, (error) => {
					if (error && error.code === 'ENOENT') {
						console.error(`File not found: ${join(path, filename)}.`);
						reject(error);
					}
				});

				dempsProcess.on('spawn', () => {
					isRunning = true;
					uniquePool.add('dempsProcess', dempsProcess);

					if (onStart) {
						onStart();
					}
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
