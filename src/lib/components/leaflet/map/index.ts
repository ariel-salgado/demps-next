import type { Map, FeatureGroup, LayerGroup } from 'leaflet';

export { default as Map } from './map.svelte';
export { contextKey } from './map.svelte';

export type MapContext = {
	map: Map;
	featureGroup: FeatureGroup;
	overlayLayer: LayerGroup;
};
