<script context="module" lang="ts">
	function layerToGeometry(layer: Layer) {
		if (layer instanceof window.L.Polygon) {
			const coordinates = layer.getLatLngs();
			return new window.L.Polygon(coordinates);
		} else if (layer instanceof window.L.Circle) {
			const coordinates = layer.getLatLng();
			const radius = Number(layer.getRadius().toFixed(6));
			return new window.L.Circle(coordinates, radius);
		}
		return;
	}

	function geometryToGeoJSON<T extends Layer | Polygon | Circle>(feature: T) {
		let featureGeoJSON: Feature<G> | undefined;

		if (feature instanceof window.L.Circle) {
			featureGeoJSON = window.L.PM.Utils.circleToPolygon(feature, 18).toGeoJSON(6);

			featureGeoJSON.properties!.radius = Number(feature.getRadius().toFixed(6));
			featureGeoJSON.properties!.center = [
				Number(feature.getLatLng().lat.toFixed(6)),
				Number(feature.getLatLng().lng.toFixed(6))
			];
		} else if (feature instanceof window.L.Polygon) {
			featureGeoJSON = feature.toGeoJSON(6);
		} else {
			return;
		}

		//@ts-expect-error - id is an added property
		return { id: feature.id, ...featureGeoJSON };
	}

	function geoJSONToGeometry(feature: Feature<G>) {
		//@ts-expect-error - radius and center are added properties
		const { radius, center } = feature.properties;

		if (radius && center.length > 0) {
			const coordinates = new window.L.LatLng(center[0], center[1]);
			return new window.L.Circle(coordinates, radius);
		} else {
			const coordinates = window.L.GeoJSON.coordsToLatLngs(feature.geometry.coordinates.flat());
			return new window.L.Polygon(coordinates);
		}
	}
</script>

<script lang="ts">
	import type { G } from '$lib/types';
	import type { Feature } from 'geojson';
	import type { Circle, Layer, Polygon } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { randomID } from '$lib/utils';
	import { getContext, onMount } from 'svelte';
	import { contextKey } from '$lib/components/leaflet';

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

		featureGroup.addLayer(feature);
		overlayLayer.addOverlay(feature, id);

		const featureGeoJSON = geometryToGeoJSON(feature);

		environment.addFeature(featureGeoJSON!, id);
	});

	featureGroup.on('pm:edit', ({ layer }) => {
		const feature = geometryToGeoJSON(layer) as Feature<G>;
		const { id, geometry } = feature;

		let editedFeature: Feature<G> | undefined;

		if (layer instanceof window.L.Circle) {
			editedFeature = environment.updateFeature(feature);
		} else if (layer instanceof window.L.Polygon) {
			editedFeature = environment.updateFeatureCoords(id as string, geometry.coordinates);
		} else {
			return;
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
