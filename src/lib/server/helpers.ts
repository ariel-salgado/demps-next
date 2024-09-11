import { FileProcessor } from '$lib/server/models';

export const create_agent_processor = (callback: (data: string) => void) => {
	const agent_processor = new FileProcessor({
		preprocess: (line, is_first_line) => {
			if (!is_first_line) {
				const splitted = line.split(' ');

				const lat = splitted.at(1);
				const lng = splitted.at(2);
				const is_visitant = splitted.at(3);
				const is_alive = splitted.at(5);

				if (lat && lng && is_visitant && is_alive) {
					return lat + ',' + lng + ',' + is_visitant + ',' + is_alive + '$';
				}
			}
		},
		on_complete: (data) => {
			callback(data);
		}
	});

	return agent_processor;
};

export const create_flood_processor = (callback: (data: string) => void) => {
	const flood_processor = new FileProcessor({
		preprocess: (line) => {
			if (line) {
				const splitted = line.split(' ');

				const lat = splitted.at(1);
				const lng = splitted.at(2);
				const depth = splitted.at(4);

				if (lat && lng && depth) {
					return lng + ',' + lat + ',' + depth + '$';
				}
			}
		},
		on_complete: (data) => {
			callback(data);
		}
	});

	return flood_processor;
};
