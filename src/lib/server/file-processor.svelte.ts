import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export function createFileProcessor(emitter: (data: string) => void) {
	const fileQueue: string[] = $state([]);

	let dataString: string = $state('');
	let isFirstLine: boolean = $state(true);
	let isProcessing: boolean = $state(false);

	function push(path: string) {
		fileQueue.push(path);
	}

	const emit = () => {
		emitter(dataString);
	};

	async function process() {
		if (fileQueue.length === 0 || isProcessing) {
			return;
		}

		isProcessing = true;

		const path = fileQueue.shift()!;

		try {
			const readInterface = createInterface({
				input: createReadStream(path),
				terminal: false
			});

			for await (const line of readInterface) {
				if (line.length > 0) {
					if (isFirstLine) {
						isFirstLine = false;
					} else {
						const parsedLine = line.split(' ');
						const lat = parsedLine[1];
						const lng = parsedLine[2];

						if (lat && lng) {
							dataString += lat + ',' + lng + '\n';
						}
					}
				}
			}

			readInterface.close();
			emit();
		} catch (error) {
			console.error(`Error reading file ${path}:`, error);
		} finally {
			dataString = '';
			isFirstLine = true;
			isProcessing = false;
			process();
		}
	}

	return {
		push,
		process
	};
}
