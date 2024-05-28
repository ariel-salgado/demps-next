import { describe, it, expect } from 'vitest';

import { environment } from '.';
import { generatePolygon } from '$lib/utils';

describe('Environment Testing', () => {
	const feature = generatePolygon();

	it('Add new feature', () => {
		environment.addFeature(feature);
		expect(environment.getFeatures()).toContain(feature);
	});

	it('Get feature', () => {
		expect(environment.getFeature(feature.id as string)).toEqual(feature);
	});

	it('Update feature coordinates', () => {
		const coordinates = generatePolygon().geometry.coordinates;
		environment.updateFeatureCoords(feature.id as string, coordinates);
		expect(environment.getFeature(feature.id as string)!.geometry.coordinates).toEqual(coordinates);
	});

	it('Update feature properties', () => {
		const properties = { someProp: 'test' };
		environment.updateFeatureProperties(feature.id as string, properties);
		const propValue = environment.getFeature(feature.id as string)!.properties!.someProp;
		expect(propValue).toEqual(properties.someProp);
	});

	it('Remove feature', () => {
		environment.removeFeature(feature.id as string);
		expect(environment.getFeatures()).not.toContain(feature);
	});
});
