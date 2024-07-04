<script lang="ts">
	import type { LayerGroup, TileLayer } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { contextKey } from '$lib/components/leaflet';
	import { getContext, onDestroy, onMount, untrack } from 'svelte';

	interface Props {
		coordinates: [number, number][];
	}

	let { coordinates }: Props = $props();

	const { map } = getContext<MapContext>(contextKey);

	let mounted: boolean = $state(false);
	let layerGroup: LayerGroup<TileLayer> = $state(window.L.layerGroup());

	$effect(() => {
		if (mounted) {
			coordinates;
			untrack(() => createMaskLayer(coordinates));
		}
	});

	onMount(async () => {
		// @ts-expect-error - maskCanvas is not recognized
		await import('leaflet-maskcanvas');

		map.addLayer(layerGroup);

		createMaskLayer(coordinates, 1);

		mounted = true;
	});

	onDestroy(() => {
		layerGroup.clearLayers();
		map.removeLayer(layerGroup);
		mounted = false;
	});

	function createMaskLayer(coordinates: [number, number][], initialOpacity: number = 0) {
		// @ts-expect-error - maskCanvas is not recognized
		const maskLayer = window.L.TileLayer.maskCanvas({
			radius: 1,
			useAbsoluteRadius: true,
			color: '#7E4BB9',
			opacity: initialOpacity,
			noMask: true,
			lineColor: '#6A3D9E'
		});

		maskLayer.setData(coordinates);

		layerGroup.addLayer(maskLayer);

		toggleLayers();
	}

	function toggleLayers() {
		if (layerGroup.getLayers().length > 1) {
			setTimeout(() => {
				const oldLayer = layerGroup.getLayers()[0] as TileLayer;
				const newLayer = layerGroup.getLayers()[1] as TileLayer;

				oldLayer.setOpacity(0);
				newLayer.setOpacity(1);

				layerGroup.removeLayer(oldLayer);
			}, 150);
		}
	}
</script>
