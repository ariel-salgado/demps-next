import type { Interface } from 'node:readline';

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

declare type FileProcessOptions = Partial<{
	preprocess?: (line: string, is_first_line: boolean) => string | void;
	on_complete?: (content: string) => void;
}>;

export class FileProcessor {
	private file_queue: string[] | null;
	private is_processing: boolean | null;
	private preprocess_callback: FileProcessOptions['preprocess'] | null;
	private on_complete_callback: FileProcessOptions['on_complete'] | null;
	private current_file_reader: Interface | null;

	constructor(options?: FileProcessOptions) {
		this.file_queue = [];
		this.is_processing = false;
		this.preprocess_callback = options?.preprocess || null;
		this.on_complete_callback = options?.on_complete || null;
		this.current_file_reader = null;
	}

	add(path: string) {
		this.file_queue?.push(path);
		this.process_next();
	}

	close() {
		if (this.current_file_reader) {
			this.current_file_reader.close();
		}
		this.file_queue = null;
		this.is_processing = null;
		this.preprocess_callback = null;
		this.on_complete_callback = null;
		this.current_file_reader = null;
	}

	on_preprocess(callback: FileProcessOptions['preprocess']) {
		this.preprocess_callback = callback;
	}

	on_complete(callback: FileProcessOptions['on_complete']) {
		this.on_complete_callback = callback;
	}

	private async process_next() {
		if (this.file_queue?.length === 0 || this.is_processing) {
			return;
		}

		this.is_processing = true;
		const path = this.file_queue?.shift() as string;
		await this.process_file(path);
	}

	private async process_file(path: string) {
		try {
			if (!path) return;

			const lines: string[] = [];
			this.current_file_reader = createInterface({
				input: createReadStream(path),
				terminal: false
			});

			let is_first_line = true;

			for await (const line of this.current_file_reader) {
				const processed_line = this.preprocess_callback
					? this.preprocess_callback(line, is_first_line)
					: line;

				if (is_first_line) {
					is_first_line = false;
				}

				if (processed_line) {
					lines.push(processed_line);
				}
			}

			this.on_complete_callback?.(lines.join(''));
		} catch {
			// console.error(`Error reading file ${path}:`, error);
		} finally {
			this.current_file_reader?.close();
			this.current_file_reader = null;
			this.is_processing = false;
			this.process_next();
		}
	}
}
