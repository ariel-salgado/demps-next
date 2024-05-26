<script lang="ts">
	import type { MapContext } from '$lib/components/leaflet/map';

	import { getContext, onMount } from 'svelte';
	import { contextKey } from '$lib/components/leaflet/map';

	const { map, featureGroup } = getContext<MapContext>(contextKey);

	console.log(map);

	onMount(async () => {
		if (!map.pm) {
			await import('@geoman-io/leaflet-geoman-free');
			await import('@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css');
		}

		// @ts-expect-error - reInitLayer accepts the map object
		window.L.PM.reInitLayer(map);
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
</script>
