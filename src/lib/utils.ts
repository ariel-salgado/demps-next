import type { G } from '$lib/types';
import type { ClassValue } from 'clsx';
import type { Feature, FeatureCollection } from 'geojson';

import { clsx } from 'clsx';
import { rewind } from '@turf/rewind';
import { twMerge } from 'tailwind-merge';
import { randomPolygon } from '@turf/random';
import { check } from '@placemarkio/check-geojson';

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
		if (json instanceof Object) {
			check(JSON.stringify(json));
		} else {
			check(json);
		}
		return true;
	} catch {
		return false;
	}
}
