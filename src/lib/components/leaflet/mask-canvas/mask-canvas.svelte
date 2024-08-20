<script lang="ts">
	import type { LayerGroup, TileLayer } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { contextKey } from '$lib/components/leaflet';
	import { getContext, onDestroy, onMount, untrack } from 'svelte';

	interface Props {
		coordinates: [number, number][];
		color: string;
		lineColor: string;
	}

	let { coordinates, color, lineColor }: Props = $props();

	const { map } = getContext<MapContext>(contextKey);

	let mounted: boolean = $state(false);
	let layerGroup: LayerGroup<TileLayer> | undefined = $state();

	$effect(() => {
		if (mounted && coordinates) {
			untrack(() => createMaskLayer(coordinates));
		}
	});

	onMount(async () => {
		// @ts-expect-error - maskCanvas is not typed
		await import('leaflet-maskcanvas');

		layerGroup = window.L.layerGroup();
		map.addLayer(layerGroup);
		createMaskLayer(coordinates, 1);

		mounted = true;
	});

	onDestroy(() => {
		mounted = false;
		map.removeLayer(layerGroup!);
		layerGroup!.clearLayers();
	});

	function createMaskLayer(coordinates: [number, number][], initialOpacity: number = 0) {
		// @ts-expect-error - maskCanvas is not typed
		const maskLayer = window.L.TileLayer.maskCanvas({
			radius: 1,
			noMask: true,
			useAbsoluteRadius: true,
			color: color,
			lineColor: lineColor,
			opacity: initialOpacity
		});

		maskLayer.setData(coordinates);

		layerGroup!.addLayer(maskLayer);

		toggleLayers();
	}

	function toggleLayers() {
		const layers = layerGroup!.getLayers();

		if (layers.length <= 1) return;

		// Remove old layer with a delay to prevent flickering
		setTimeout(() => {
			const [oldLayer, newLayer] = layers as [TileLayer, TileLayer];

			oldLayer.setOpacity(0);
			newLayer.setOpacity(1);

			layerGroup!.removeLayer(oldLayer);
		}, 160);
	}
</script>
