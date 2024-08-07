import { generatePolygon } from '$lib/utils';
import { createEnvironment } from '$lib/states';
import { describe, expect, test } from 'vitest';

const testEnvironment = createEnvironment();

const testFeature = generatePolygon();
const testFeatures = Array.from({ length: 2 }).map(() => generatePolygon());

describe('Environment testing', () => {
	/**
	 * Single operations
	 */
	test('Add a feature', () => {
		const addedFeature = testEnvironment.addFeature(testFeature);
		expect(testFeature).toEqual(addedFeature);
	});

	test('Get a feature', () => {
		const retrievedFeature = testEnvironment.getFeature(testFeature.id as string);
		expect(retrievedFeature).toEqual(testFeature);
	});

	test('Update feature properties', () => {
		const properties = { test: 'This is a test' };
		const updatedFeature = testEnvironment.updateFeatureProperties(
			testFeature.id as string,
			properties
		);
		expect(updatedFeature).toEqual(testEnvironment.getFeature(testFeature.id as string));
	});

	test('Update feature coordinates', () => {
		const coordinates = generatePolygon().geometry.coordinates;
		const updatedFeature = testEnvironment.updateFeatureCoords(
			testFeature.id as string,
			coordinates
		);
		expect(updatedFeature).toEqual(testEnvironment.getFeature(testFeature.id as string));
	});

	test('Update a feature', () => {
		const feature = { ...generatePolygon(), id: testFeature.id };
		const updatedFeature = testEnvironment.updateFeature(feature);
		expect(updatedFeature).toEqual(feature);
	});

	test('Remove features', () => {
		testEnvironment.removeFeature(testFeature.id as string);
		expect(testEnvironment.value.features.length).toBe(0);
	});

	/**
	 * Multiple operations
	 */
	test('Add multiple features', () => {
		testEnvironment.addFeatures(testFeatures);
		expect(testEnvironment.value.features.length).toBe(testFeatures.length);
	});

	test('Get all features', () => {
		const currentFeatures = testEnvironment.getFeatures();
		expect(currentFeatures.length).toBe(testFeatures.length);
	});

	test('Remove all features', () => {
		testEnvironment.clear();
		expect(testEnvironment.getFeatures().length).toBe(0);
	});
});
