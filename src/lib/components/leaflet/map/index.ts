import type { Environment } from '$lib/states';
import type { Map, FeatureGroup, Control } from 'leaflet';

export type MapContext = {
	map: Map;
	environment: Environment;
	featureGroup: FeatureGroup;
	overlayLayer: Control.Layers;
};
