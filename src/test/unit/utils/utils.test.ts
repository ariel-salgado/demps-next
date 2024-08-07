import { describe, expect, test } from 'vitest';
import {
	generatePolygon,
	isValidGeoJSON,
	randomID,
	splitCamelCase,
	strEqualsObj
} from '$lib/utils';
import { check, HintError } from '@placemarkio/check-geojson';

describe('Utility functions testing', () => {
	test('Generate a random id', () => {
		const firstRandom = randomID();
		const secondRandom = randomID();
		expect(firstRandom).not.toEqual(secondRandom);
	});

	test('Generate a polygon', () => {
		const generatedPolygon = generatePolygon();
		const parsedGeoJSON = check(JSON.stringify(generatedPolygon));
		expect(parsedGeoJSON).not.toBeInstanceOf(HintError);
	});

	test('String equals object', () => {
		const randomFeature = generatePolygon();
		expect(strEqualsObj(JSON.stringify(randomFeature), randomFeature));
	});

	test('GeoJSON is valid', () => {
		const randomFeature = generatePolygon();
		expect(isValidGeoJSON(randomFeature)).toBe(true);
	});

	test('Split camel case word', () => {
		const word = 'this-is-a-test';
		expect(splitCamelCase(word)).toBe('this is a test');
	});
});
