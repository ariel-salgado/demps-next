<script lang="ts">
	import type { MapContext } from '$lib/components/leaflet';

	import { getContext, onMount } from 'svelte';
	import { mapContextKey } from '$lib/components/leaflet';

	interface Props {
		coordinates: [number, number][];
	}

	let { coordinates = $bindable() }: Props = $props();

	const { map } = getContext<MapContext>(mapContextKey);

	onMount(async () => {
		// @ts-expect-error - maskCanvas is not recognized
		await import('leaflet-maskcanvas');

		// @ts-expect-error - maskCanvas is not recognized
		const markerLayer = window.L.TileLayer.maskCanvas({
			radius: 1,
			useAbsoluteRadius: true,
			color: '#7E4BB9',
			opacity: 1,
			noMask: true,
			lineColor: '#6A3D9E'
		});

		markerLayer.setData(coordinates);

		const bounds = markerLayer.bounds;

		markerLayer.addTo(map);

		if (bounds.isValid()) {
			map.fitBounds(bounds);
		}
	});
</script>
