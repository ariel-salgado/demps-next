<script lang="ts">
	import type { G } from '$lib/types';
	import type { Layer } from 'leaflet';
	import type { Feature } from 'geojson';
	import type { MapContext } from '$lib/components/leaflet';

	import { randomID } from '$lib/utils';
	import { getContext, onMount } from 'svelte';
	import { createPopup, contextKey } from '$lib/components/leaflet';
	import {
		geometryToGeoJSON,
		geoJSONToGeometry,
		layerToGeometry,
		attachPopupEvents,
		updateFeatureProperties
	} from '$lib/components/leaflet/helpers';

	const { map, environment, featureGroup, overlayLayer } = getContext<MapContext>(contextKey);

	onMount(async () => {
		if (!map.pm) {
			await import('@geoman-io/leaflet-geoman-free');
			await import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');
		}

		window.L.PM.reInitLayer(map as unknown as Layer);
		window.L.PM.reInitLayer(featureGroup);

		map.pm.setLang('es');

		map.pm.setGlobalOptions({
			resizableCircle: true,
			layerGroup: featureGroup,
			limitMarkersToCount: 10
		});

		map.pm.addControls({
			position: 'topleft',
			drawText: false,
			drawMarker: false,
			cutPolygon: false,
			drawPolyline: false,
			drawCircleMarker: false
		});

		// Add aria-label to the draw buttons
		window.document.querySelectorAll('a.leaflet-buttons-control-button').forEach((button) => {
			button.setAttribute('aria-label', button.parentElement!.getAttribute('title')!);
		});
	});

	map.on('pm:create', ({ layer }) => {
		featureGroup.removeLayer(layer);

		const feature = layerToGeometry(layer);

		if (!feature) return;

		const id = randomID();
		Object.defineProperty(feature, 'id', { value: id, writable: false });

		const popup = createPopup(geometryToGeoJSON(feature) as Feature<G>);

		attachPopupEvents(popup, (popupForm) => {
			updateFeatureProperties(popupForm, featureGroup);
		});

		feature.bindPopup(popup);

		featureGroup.addLayer(feature);
		overlayLayer.addOverlay(feature, id);

		const featureGeoJSON = geometryToGeoJSON(feature);

		environment.addFeature(featureGeoJSON!, id);
	});

	// TODO: Maybe can edit the layer directly ?
	// TODO: Prevent popup open on edit. It bugs the popup and won't open again.
	featureGroup.on('pm:edit', ({ layer }) => {
		const feature = geometryToGeoJSON(layer) as Feature<G>;
		const { id, geometry } = feature;

		let editedFeature: Feature<G> | undefined;

		if (layer instanceof window.L.Circle) {
			editedFeature = environment.updateFeature(feature);
		} else {
			editedFeature = environment.updateFeatureCoords(id as string, geometry.coordinates);
		}

		featureGroup.removeLayer(layer);
		overlayLayer.removeLayer(layer);

		const editedLayer = geoJSONToGeometry(editedFeature);
		Object.defineProperty(editedLayer, 'id', { value: id, writable: false });

		featureGroup.addLayer(editedLayer);
		overlayLayer.addOverlay(editedLayer, id as string);
	});

	map.on('pm:remove', ({ layer }) => {
		featureGroup.removeLayer(layer);
		overlayLayer.removeLayer(layer);

		// @ts-expect-error - id is an added property
		environment.removeFeature(layer.id);
	});
</script>
