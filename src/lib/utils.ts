import type { G } from '$lib/types';
import type { ClassValue } from 'clsx';
import type { Feature, FeatureCollection } from 'geojson';

import { clsx } from 'clsx';
import { rewind } from '@turf/rewind';
import { twMerge } from 'tailwind-merge';
import { randomPolygon } from '@turf/random';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generatePolygon(): Feature<G> {
	const id = crypto.randomUUID().split('-').at(-1) as string;
	const feature = (rewind(randomPolygon()) as FeatureCollection<G>).features.at(0)!;

	return { id, ...feature };
}
