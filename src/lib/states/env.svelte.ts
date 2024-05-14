import type {
	Feature,
	Geometry,
	GeoJsonProperties,
	FeatureCollection,
	GeometryCollection
} from 'geojson';

import { Map } from 'svelte/reactivity';

type G = Exclude<Geometry, GeometryCollection>;

export class Environment<T extends G> {
	private _features: Map<string, Feature<T>>;

	constructor(geojson?: FeatureCollection<T>) {
		const value = geojson ? geojson.features : [];

		this._features = new Map(value.map((feature) => [String(feature.id), feature]));
	}

	get(id: string) {
		return this._features.get(id);
	}

	get value() {
		return {
			type: 'FeatureCollection',
			features: Array.from(this._features.values())
		};
	}

	get features() {
		return Array.from(this._features.values());
	}

	addFeature(feature: Feature<T>, id?: string) {
		const featureId = id || String(feature.id);

		if (this._features.has(featureId)) {
			throw new Error(`Feature with id ${featureId} already exists`);
		}

		feature.id = featureId;

		this._features.set(featureId, feature);
	}

	updateFeatureCoords(id: string, coords: T['coordinates']) {
		if (!this._features.has(id)) {
			throw new Error(`Feature with id ${id} not found`);
		}

		const feature = this._features.get(id)!;

		feature.geometry.coordinates = coords;

		this._features.set(id, feature);
	}

	updateFeatureProperties(id: string, properties: GeoJsonProperties) {
		if (!this._features.has(id)) {
			throw new Error(`Feature with id ${id} not found`);
		}

		const feature = this._features.get(id)!;

		feature.properties = {
			...feature.properties,
			...properties
		};

		this._features.set(id, feature);
	}

	removeFeature(id: string) {
		if (!this._features.has(id)) {
			throw new Error(`Feature with id ${id} not found`);
		}

		this._features.delete(id);
	}
}
