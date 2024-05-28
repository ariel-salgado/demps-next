import type { G } from '$lib/types';
import type { Feature, FeatureCollection } from 'geojson';

import { Map } from 'svelte/reactivity';

export function createEnvironment(geojson?: FeatureCollection<G>) {
	const value = geojson ? geojson.features : [];

	const _features: Map<string, Feature<G>> = new Map(
		value.map((feature) => [String(feature.id), feature])
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

	function removeFeature(id: string) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		_features.delete(id);
	}

	return {
		get value(): FeatureCollection {
			return {
				type: 'FeatureCollection',
				features: Array.from(_features.values())
			};
		},
		getFeature,
		getFeatures,
		addFeature,
		updateFeature,
		removeFeature
	};
}
