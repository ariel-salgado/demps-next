import type { G } from '$lib/types';
import type { Feature, FeatureCollection } from 'geojson';

import { rewind } from '@turf/rewind';
import { randomPolygon } from '@turf/random';

export function generatePolygon(): Feature<G> {
	const id = crypto.randomUUID().split('-').at(-1) as string;
	const feature = (rewind(randomPolygon()) as FeatureCollection<G>).features.at(0)!;

	return { id, ...feature };
}
