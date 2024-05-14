import { describe, it, expect } from 'vitest';

import { env } from '$lib/states';
import { generatePolygon } from '$lib/utils';

describe('Environment Testing', () => {
	const feature = generatePolygon();

	it('Add new feature', () => {
		env.addFeature(feature);
		expect(env.features).toContain(feature);
	});

	it('Get feature', () => {
		expect(env.get(feature.id as string)).toEqual(feature);
	});

	it('Update feature coordinates', () => {
		const coordinates = generatePolygon().geometry.coordinates;
		env.updateFeatureCoords(feature.id as string, coordinates);
		expect(env.get(feature.id as string)!.geometry.coordinates).toEqual(coordinates);
	});

	it('Update feature properties', () => {
		const properties = { someProp: 'test' };
		env.updateFeatureProperties(feature.id as string, properties);
		const propValue = env.get(feature.id as string)!.properties!.someProp;
		expect(propValue).toEqual(properties.someProp);
	});

	it('Remove feature', () => {
		env.removeFeature(feature.id as string);
		expect(env.features).not.toContain(feature);
	});
});
