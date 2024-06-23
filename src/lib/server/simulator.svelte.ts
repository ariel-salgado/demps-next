import type { DempsProcess } from '.';
import type { ChildProcess } from 'child_process';

import { spawn } from 'child_process';
import { uniquePool } from '$lib/states';
import { DEMPS_SIM_DIR } from '$env/static/private';

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
						stdio: 'inherit',
						shell: true
					}
				);

				dempsProcess.on('spawn', () => {
					console.log('Process spawned');
					isRunning = true;
					uniquePool.add('dempsProcess', dempsProcess);
				});

				dempsProcess.on('error', async (error) => {
					console.error('Process error:', error);
					await shutdown('SIGTERM');
					reject(error);
				});

				dempsProcess.on('exit', async (code, signal) => {
					console.log(`Process exited with code ${code} and signal ${signal}`);
					await shutdown(signal || 'SIGTERM');
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
							forceKill();
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

			console.log(`Shutting down gracefully with signal ${signal}...`);

			dempsProcess?.kill(signal);

			const timeout = setTimeout(() => {
				console.log('Shutdown timeout reached');
				forceKill();
				resolve();
			}, 3000); // Increased timeout to 3 seconds

			dempsProcess?.once('exit', () => {
				console.log('Process exited during shutdown');
				clearTimeout(timeout);
				resolve();
			});
		});
	}

	function forceKill() {
		if (dempsProcess && !dempsProcess.killed) {
			console.log('Force killing the process...');
			dempsProcess.kill('SIGKILL');
		}
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
