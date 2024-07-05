import type { G } from '$lib/types';
import type { ClassValue } from 'clsx';
import type { Feature, FeatureCollection } from 'geojson';

// Others
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { browser } from '$app/environment';

// GeoJSON related
import { rewind } from '@turf/rewind';
import { truncate } from '@turf/truncate';
import { randomPolygon } from '@turf/random';
import { HintError, check } from '@placemarkio/check-geojson';

export function saveLocalStorage(key: string, value: any) {
	if (browser) {
		localStorage.setItem(key, JSON.stringify(value));
	}
}

export function loadLocalStorage<T>(key: string) {
	const stored = browser ? localStorage.getItem(key) : null;
	try {
		return stored ? (JSON.parse(stored) as T) : null;
	} catch {
		return null;
	}
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function randomID(): string {
	return crypto.randomUUID().split('-').at(-1) as string;
}

export function generatePolygon(): Feature<G> {
	const id = randomID();
	const feature = (rewind(randomPolygon()) as FeatureCollection<G>).features.at(0)!;

	return { id, ...feature };
}

export function strEqualsObj(str: string, obj: object) {
	try {
		return JSON.stringify(JSON.parse(str)) === JSON.stringify(obj);
	} catch {
		return false;
	}
}

export function isValidGeoJSON(json: string | object) {
	try {
		if (typeof json === 'object') {
			json = JSON.stringify(json);
		}

		check(json);
		return true;
	} catch (e) {
		if (e instanceof HintError || e instanceof Error) {
			console.error(e.message);
			return false;
		}
		throw e;
	}
}

export function preprocessGeoJSON(geojson: FeatureCollection | string) {
	try {
		if (typeof geojson === 'string') {
			geojson = JSON.parse(geojson) as FeatureCollection;
		}

		if (!isValidGeoJSON(geojson)) {
			return;
		}

		const features: Feature<G>[] = [];

		for (const feature of geojson.features) {
			const id = feature.id ? String(feature.id) : randomID();
			const truncated = truncate(feature, { precision: 6, coordinates: 2, mutate: true });
			const rewinded = rewind(truncated, { mutate: true }) as Feature<G>;

			features.push({ id, ...rewinded });
		}

		return { type: 'FeatureCollection', features } as FeatureCollection<G>;
	} catch {
		throw new Error('Invalid GeoJSON');
	}
}

export function debounce<T extends (...args: Parameters<T>) => void>(
	this: ThisParameterType<T>,
	fn: T,
	delay: number
) {
	let timer: ReturnType<typeof setTimeout> | undefined;
	return (...args: Parameters<T>) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn.apply(this, args), delay);
	};
}

export function splitCamelCase(word: string) {
	return word.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function flattenJSON(obj: object, prefix: string = '') {
	const flatObj: Record<string, unknown> = {};

	for (const key of Object.keys(obj)) {
		const value: Array<unknown> = obj[key as keyof typeof obj];
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				value.forEach((item, index) => {
					if (typeof item === 'object') {
						Object.assign(flatObj, flattenJSON(item!, `${fullKey}.${index}`));
					} else {
						flatObj[`${fullKey}.${index}`] = item;
					}
				});
			} else {
				Object.assign(flatObj, flattenJSON(value, fullKey));
			}
		} else {
			flatObj[fullKey] = value;
		}
	}

	return flatObj;
}
