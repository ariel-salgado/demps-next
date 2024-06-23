import type { DempsProcess } from '.';
import type { ChildProcess } from 'child_process';

import { spawn } from 'child_process';
import { uniquePool } from '$lib/states';
import { DEMPS_SIM_DIR } from '$env/static/private';

import treeKill from 'tree-kill';

export function createDempsProcess() {
	let isRunning: boolean = $state(false);
	let dempsProcess: ChildProcess | undefined = $state();

	if (uniquePool.has('dempsProcess')) {
		const dp = uniquePool.pop<DempsProcess>('dempsProcess');
		if (dp?.isRunning) dp.abort();
	}

	async function run(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				dempsProcess = spawn(
					'./run.sh',
					['--config', 'vdm-pob-vergara.config', '--outdir', 'output/vdm-pob-vergara'],
					{
						cwd: DEMPS_SIM_DIR,
						shell: true
					}
				);

				dempsProcess.on('spawn', () => {
					isRunning = true;
					uniquePool.add('dempsProcess', dempsProcess);
				});

				dempsProcess.on('error', async (error) => {
					await shutdown('SIGTERM');
					reject(error);
				});

				dempsProcess.on('exit', async (code, signal) => {
					if (code === 0) {
						resolve();
					} else {
						reject(new Error(`Process exited with code ${code} and signal ${signal}`));
					}
				});

				// Handle both SIGINT and SIGTERM
				['SIGINT', 'SIGTERM'].forEach((signal) => {
					process.on(signal, async () => {
						console.log(`Received ${signal}`);
						try {
							await shutdown(signal as NodeJS.Signals);
							process.exit(0);
						} catch (error) {
							console.error('Error during shutdown:', error);
							process.exit(1);
						}
					});
				});
			} catch (error) {
				console.error('Error spawning process:', error);
				reject(error);
			}
		});
	}

	async function shutdown(signal: NodeJS.Signals): Promise<void> {
		return new Promise((resolve) => {
			if (!dempsProcess || dempsProcess.killed) {
				console.log('Process was already killed or does not exist');
				resolve();
			}

			if (!dempsProcess?.killed) {
				console.log(`Shutting down gracefully with signal ${signal}...`);

				if (dempsProcess?.pid) {
					treeKill(dempsProcess.pid, signal, (err) => {
						if (err) {
							console.error('Error killing process:', err);
						} else {
							console.log('Process killed successfully');
						}
					});
				} else {
					dempsProcess?.kill(signal);
				}
			}

			resolve();
		});
	}

	async function abort() {
		await shutdown('SIGTERM');
		reset();
	}

	function reset() {
		isRunning = false;
		dempsProcess = undefined;
	}

	return {
		run,
		abort,
		get isRunning() {
			return isRunning;
		}
	};
}
