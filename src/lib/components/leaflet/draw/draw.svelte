<script lang="ts">
	import type { G } from '$lib/types';
	import type { Feature } from 'geojson';
	import type { Circle, Layer, Polygon } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet/map';

	import { randomID } from '$lib/utils/utils';
	import { getContext, onMount } from 'svelte';
	import { contextKey } from '$lib/components/leaflet/map';

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
			limitMarkersToCount: 20
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

	function layerToGeometry<T extends Polygon | Circle>(layer: Layer) {
		let feature: T | undefined;

		if (layer instanceof window.L.Polygon) {
			const coordinates = layer.getLatLngs();
			feature = new window.L.Polygon(coordinates) as T;
		} else if (layer instanceof window.L.Circle) {
			const coordinates = layer.getLatLng();
			const radius = Number(layer.getRadius().toFixed(6));
			feature = new window.L.Circle(coordinates, radius) as T;
		} else {
			return;
		}

		return feature;
	}

	function geometryToGeoJSON<T extends (Layer | Polygon | Circle) & Partial<{ id: string }>>(
		feature: T
	) {
		let featureGeoJSON: Feature | undefined;

		if (feature instanceof window.L.Circle) {
			const properties = environment.getFeature(feature.id!)?.properties;

			featureGeoJSON = window.L.PM.Utils.circleToPolygon(feature as Circle, 18).toGeoJSON(6);
			featureGeoJSON.properties = {
				...properties,
				radius: Number((feature as Circle).getRadius().toFixed(6)),
				center: [
					Number((feature as Circle).getLatLng().lat.toFixed(6)),
					Number((feature as Circle).getLatLng().lng.toFixed(6))
				]
			};
		} else if (feature instanceof window.L.Polygon) {
			featureGeoJSON = feature.toGeoJSON(6);
		} else {
			return;
		}

		featureGeoJSON = { id: feature.id, ...featureGeoJSON };

		return featureGeoJSON;
	}

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
		let feature = geometryToGeoJSON(layer) as Feature<G>;
		environment.updateFeatureCoords(feature.id as string, feature.geometry.coordinates);
	});
</script>
