import type { ChildProcess, ExecFileException } from 'node:child_process';

import { execFile } from 'node:child_process';
import { SvelteMap } from 'svelte/reactivity';

const child_processes: SvelteMap<string, Process> = new SvelteMap();

process.on('exit', () => {
	for (const child_process of child_processes.values()) {
		child_process.kill();
	}
	child_processes.clear();
});

export class Process {
	private child_process: ChildProcess | null;

	constructor(id: string, path: string, args: string[], options?: Parameters<typeof execFile>[2]) {
		this.kill_existing_process(id);

		this.child_process = execFile(path, args, options);

		child_processes.set(id, this);

		this.child_process.on('close', () => {
			if (this.is_running) {
				this.kill();
				child_processes.delete(id);
			}
		});
	}

	private kill_existing_process(id: string) {
		if (child_processes.has(id)) {
			const existing_process = child_processes.get(id);
			existing_process!.kill();

			if (existing_process?.is_running) {
				existing_process.force_kill();
			}

			child_processes.delete(id);
		}
	}

	get is_running() {
		return this.child_process?.exitCode === null;
	}

	on_spawn(callback: () => void) {
		this.child_process?.on('spawn', callback);
	}

	on_error(callback: (error: Error | ExecFileException) => void) {
		this.child_process?.on('error', callback);
	}

	on_message(callback: (message: string) => void) {
		this.child_process?.stdout?.on('data', callback);
	}

	on_close(callback: (code: number | null, signal: NodeJS.Signals) => void) {
		this.child_process?.on('close', callback);
	}

	on_exit(callback: (code: number | null, signal: NodeJS.Signals) => void) {
		this.child_process?.on('exit', callback);
	}

	kill(signal?: NodeJS.Signals) {
		if (!this.child_process?.killed) {
			this.child_process?.kill(signal || 'SIGTERM');
			this.child_process?.removeAllListeners();
			this.child_process = null;
		}
	}

	force_kill() {
		this.kill('SIGKILL');
	}
}
