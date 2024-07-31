import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export function createFileProcessor(
	refine: (line: string, isFirstLine: boolean) => string | void,
	emitter: (data: string) => void
) {
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
			const data: string[] = [];

			const readInterface = createInterface({
				input: createReadStream(path),
				terminal: false
			});

			let isFirstLine = true;

			for await (const line of readInterface) {
				const refinedData = refine(line, isFirstLine);

				if (isFirstLine) {
					isFirstLine = false;
				}

				if (refinedData) {
					data.push(refinedData);
				}
			}

			readInterface.close();

			emit(data.join(''));
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
