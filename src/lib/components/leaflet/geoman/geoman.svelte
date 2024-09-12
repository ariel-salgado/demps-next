<script lang="ts">
	import type { G } from '$lib/types';
	import type { Feature } from 'geojson';
	import type { Layer, Path } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { randomID } from '$lib/utils';
	import { getContext, onMount } from 'svelte';
	import { contextKey } from '$lib/components/leaflet';
	import {
		geometryToGeoJSON,
		geoJSONToGeometry,
		layerToGeometry,
		addPopupToLayer
	} from '$lib/components/leaflet/helpers';

	const { map, environment, featureGroup, overlayLayer, isLayerEditable } =
		getContext<MapContext>(contextKey);

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

		/**
		 * Add aria-label to the draw buttons for accessibilty
		 */
		window.document.querySelectorAll('a.leaflet-buttons-control-button').forEach((button) => {
			button.setAttribute('aria-label', button.parentElement!.getAttribute('title')!);
		});
	});

	/**
	 * When a new layer is created it gets removed from the featureGroup as it needs to be updated.
	 * An internal id is given to the created layer and a popup is attached.
	 * Then is added to the map and the environment.
	 */
	map.on('pm:create', ({ layer }) => {
		featureGroup.removeLayer(layer);

		const createdLayer = layerToGeometry(layer);

		if (!createdLayer) return;

		const id = randomID();
		Object.defineProperty(createdLayer, 'id', { value: id, writable: false });

		const createdFeature = geometryToGeoJSON(createdLayer) as Feature<G>;

		if (isLayerEditable) {
			addPopupToLayer(createdLayer, createdFeature, featureGroup);
		}

		featureGroup.addLayer(createdLayer);
		overlayLayer.addOverlay(createdLayer, id);

		environment.addFeature(createdFeature, id);
	});

	/**
	 * When a layer is edited it is removed from the map to work with it first.
	 * Updates the coordinates and properties of the layer feature.
	 * Reassigns the internal id and attach the popup.
	 */
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

		(editedLayer as Path).setStyle(layer.options);

		Object.defineProperty(editedLayer, 'id', { value: id, writable: false });

		if (isLayerEditable) {
			addPopupToLayer(editedLayer, editedFeature, featureGroup);
		}

		featureGroup.addLayer(editedLayer);
		overlayLayer.addOverlay(editedLayer, id as string);
	});

	map.on('pm:remove', ({ layer }) => {
		featureGroup.removeLayer(layer);
		overlayLayer.removeLayer(layer);

		// @ts-expect-error - id is an added property
		environment.removeFeature(layer.id);
	});

	/**
	 * When the layer has a popup attached and is dragged it displays the popup. That is bad.
	 * So when the layer is about to be dragged the click event is removed and then added again
	 * after the user ends the dragging.
	 */
	featureGroup.on('pm:dragstart', ({ layer }) => {
		layer.removeEventListener('click');
	});

	featureGroup.on('pm:dragend', ({ layer }) => {
		layer.addEventListener('click', () => {
			layer.openPopup();
		});
	});
</script>
