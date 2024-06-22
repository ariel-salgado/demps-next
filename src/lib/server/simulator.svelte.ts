import type { ChildProcess } from 'child_process';

import { spawn } from 'child_process';
import { DEMPS_SIM_DIR } from '$env/static/private';

export function runDempsSim(): Promise<void> {
	return new Promise((resolve, reject) => {
		const dempsProcess = spawn(
			'./run.sh',
			['--config', 'vdm-pob-vergara.config', '--outdir', 'output/vdm-pob-vergara'],
			{
				cwd: DEMPS_SIM_DIR,
				stdio: 'inherit',
				shell: true
			}
		);

		dempsProcess.on('error', async (error) => {
			console.error('Process error:', error);
			await shutdown(dempsProcess, 'SIGTERM');
			reject(error);
		});

		dempsProcess.on('exit', async (code, signal) => {
			console.log('Exit:', code, signal);
			await shutdown(dempsProcess, signal || 'SIGTERM');
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`Process exited with code ${code} and signal ${signal}`));
			}
		});

		// User pressed Ctrl+C
		process.on('SIGINT', () => {
			shutdown(dempsProcess, 'SIGINT')
				.then(() => process.exit(0))
				.catch((error) => {
					console.error('Error during shutdown:', error);
					process.exit(1);
				});
		});
	});
}

async function shutdown(childProcess: ChildProcess, signal: NodeJS.Signals): Promise<void> {
	return new Promise((resolve) => {
		console.log(`Received ${signal}. Shutting down gracefully...`);

		if (childProcess.killed) {
			console.log('Process was already killed');
			return resolve();
		}

		childProcess.kill(signal);

		const timeout = setTimeout(() => {
			console.log('Force killing the process...');
			childProcess.kill('SIGKILL');
		}, 1000);

		childProcess.on('exit', () => {
			clearTimeout(timeout);
			resolve();
		});
	});
}
