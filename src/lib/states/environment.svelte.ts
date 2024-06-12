import type { G } from '$lib/types';
import type { Feature, FeatureCollection } from 'geojson';

import { Map } from 'svelte/reactivity';
import { loadLocalStorage, saveLocalStorage } from '$lib/utils';

export function createEnvironment(features?: Feature<G>[]) {
	let _features: Map<string, Feature<G>>;

	$effect.root(() => {
		const stored = loadLocalStorage<Feature<G>[]>('environment');
		const init = stored ? stored : features || [];

		_features = new Map();
		addFeatures(init);

		$effect(() => {
			saveLocalStorage('environment', getFeatures());
		});

		return () => clear();
	});

	function clear() {
		_features.clear();
	}

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
		return feature;
	}

	function addFeatures(features: FeatureCollection | Feature<G>[]) {
		if (typeof features === 'object' && Object.hasOwn(features, 'type')) {
			features = (features as FeatureCollection).features as Feature<G>[];
		}

		for (const feature of features as Feature<G>[]) {
			addFeature(feature);
		}
	}

	function updateFeature(id: string, feature: Feature<G>) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		_features.set(id, feature);
		return feature;
	}

	function updateFeatureCoords(id: string, coordinates: Feature<G>['geometry']['coordinates']) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		// Little tweak to avoid reactivity issues
		const feature = Object.assign({}, _features.get(id));
		feature.geometry.coordinates = coordinates;

		_features.set(id, feature);
		return feature;
	}

	function updateFeatureProperties(id: string, properties: Feature<G>['properties']) {
		if (!_features.has(id)) throw new Error(`Feature with id ${id} not found`);

		// Little tweak to avoid reactivity issues
		const feature = Object.assign({}, _features.get(id));
		feature.properties = properties;

		_features.set(id, feature);
		return feature;
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
		set value(geojson: FeatureCollection) {
			clear();
			addFeatures(geojson);
		},
		clear,
		getFeature,
		getFeatures,
		addFeature,
		addFeatures,
		updateFeature,
		updateFeatureCoords,
		updateFeatureProperties,
		removeFeature
	};
}
