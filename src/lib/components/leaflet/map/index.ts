import type { Environment } from '$lib/states';
import type { Map as LMap, FeatureGroup, Control } from 'leaflet';

import Map from './map.svelte';
import { contextKey } from './context';

type MapContext = {
	map: LMap;
	environment: Environment;
	featureGroup: FeatureGroup;
	overlayLayer: Control.Layers;
	isLayerEditable: boolean;
};

export type { MapContext };

export { Map, contextKey };
