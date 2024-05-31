import type { G } from '$lib/types';
import type { Feature, FeatureCollection } from 'geojson';

import { Map } from 'svelte/reactivity';

export function createEnvironment(geojson?: FeatureCollection<G>) {
	const _value = geojson ? geojson.features : [];

	const _features: Map<string, Feature<G>> = new Map(
		_value.map((feature) => [String(feature.id), feature])
	);

	function getFeature(id: string) {
		return _features.get(id);
	}

	function getFeatures() {
		return Array.from(_features.values());
	}

	function addFeature(feature: Feature, id?: string) {
		const featureId = id || String(feature.id);

		if (_features.has(featureId)) throw new Error(`Feature with id ${featureId} already exists`);

		feature.id = featureId;
		_features.set(featureId, feature as Feature<G>);
	}

	function updateFeature(id: string, feature: Feature<G>) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		_features.set(id, feature);
	}

	function updateFeatureCoords(id: string, coordinates: Feature<G>['geometry']['coordinates']) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		// Little tweak to avoid reactivity issues
		const feature = Object.assign({}, _features.get(id));
		feature.geometry.coordinates = coordinates;

		_features.set(id, feature);
	}

	function updateFeatureProperties(id: string, properties: Feature<G>['properties']) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		// Little tweak to avoid reactivity issues
		const feature = Object.assign({}, _features.get(id));
		feature.properties = properties;

		_features.set(id, feature);
	}

	function removeFeature(id: string) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		_features.delete(id);
	}

	return {
		get value(): FeatureCollection {
			return {
				type: 'FeatureCollection',
				features: getFeatures()
			};
		},
		getFeature,
		getFeatures,
		addFeature,
		updateFeature,
		updateFeatureCoords,
		updateFeatureProperties,
		removeFeature
	};
}
