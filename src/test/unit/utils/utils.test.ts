import { generatePolygon } from '$lib/utils';
import { describe, expect, test } from 'vitest';
import { check, HintError } from '@placemarkio/check-geojson';

describe('Utility functions testing', () => {
	test('Generate a polygon', () => {
		const generatedPolygon = generatePolygon();
		const parsedGeoJSON = check(JSON.stringify(generatedPolygon));
		expect(parsedGeoJSON).not.toBeInstanceOf(HintError);
	});
});
