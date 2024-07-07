import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export function createFileProcessor(emitter: (data: string) => void) {
	const fileQueue: string[] = $state([]);
	let isProcessing: boolean = $state(false);

	function push(path: string) {
		fileQueue.push(path);
		processNext();
	}

	function emit(data: string) {
		emitter(data);
	}

	async function processNext() {
		if (fileQueue.length === 0 || isProcessing) {
			return;
		}

		isProcessing = true;

		const path = fileQueue.shift()!;

		try {
			// console.time('readFile');

			const data = await readFile(path);

			// console.timeEnd('readFile');

			emit(data);
		} catch (error) {
			console.error(`Error reading file ${path}:`, error);
		} finally {
			isProcessing = false;
			processNext();
		}
	}

	return {
		push
	};
}

async function readFile(path: string) {
	const data: string[] = [];

	const readInterface = createInterface({
		input: createReadStream(path),
		output: process.stdout,
		terminal: false
	});

	for await (const line of readInterface) {
		const [, lat, lng] = line.split(' ');
		data.push(`${lat},${lng}`);
	}

	return data.join('\n');
}
