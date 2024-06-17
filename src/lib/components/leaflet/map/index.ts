import type { Environment } from '$lib/states';
import type { Map as LMap, FeatureGroup, Control } from 'leaflet';

import Map, { contextKey } from './map.svelte';

type MapContext = {
	map: LMap;
	environment: Environment;
	featureGroup: FeatureGroup;
	overlayLayer: Control.Layers;
};

export type { MapContext };

export { Map, contextKey };
