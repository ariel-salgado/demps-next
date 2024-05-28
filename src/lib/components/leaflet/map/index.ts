import type { Environment } from '$lib/states';
import type { Map, FeatureGroup, Control } from 'leaflet';

export { default as Map } from './map.svelte';
export { contextKey } from './map.svelte';

export type MapContext = {
	map: Map;
	environment: Environment;
	featureGroup: FeatureGroup;
	overlayLayer: Control.Layers;
};
