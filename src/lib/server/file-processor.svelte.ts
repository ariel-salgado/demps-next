import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

export function createFileProcessor(emitter: (data: string) => void) {
	const fileQueue: string[] = $state([]);
	const coordsData: { lat: string; lng: string }[] = $state([]);

	let isProcessing: boolean = $state(false);

	function push(path: string) {
		fileQueue.push(path);
	}

	const emit = () => {
		const dataString = coordsData.map((item) => `${item.lat}, ${item.lng}`).join('\n');
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
					const parsedLine = line.split(' ');
					const lat = parsedLine[1];
					const lng = parsedLine[2];

					if (lat && lng) {
						coordsData.push({ lat, lng });
					}
				}
			}

			emit();
		} catch (error) {
			console.error(`Error reading file ${path}:`, error);
		} finally {
			coordsData.length = 0;
			isProcessing = false;
			process();
		}
	}

	return {
		push,
		process
	};
}
