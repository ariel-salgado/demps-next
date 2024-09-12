<script lang="ts">
	import type { LayerGroup, TileLayer } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { contextKey } from '$lib/components/leaflet';
	import { getContext, onDestroy, onMount, untrack } from 'svelte';

	interface Props {
		coordinates: [number, number][];
		radius?: number;
		color?: string;
		lineColor?: string;
		opacity?: number;
	}

	let { coordinates, radius, color, lineColor, opacity }: Props = $props();

	const { map } = getContext<MapContext>(contextKey);

	let mounted: boolean = $state(false);
	let layerGroup: LayerGroup<TileLayer> | undefined = $state();

	/**
	 * After the component being mounted and the value of coordinates is truthy or changes
	 * calls the function createMaskLayer with initial opacity 0.
	 */
	$effect(() => {
		if (mounted && coordinates) {
			untrack(() => createMaskLayer(coordinates));
		}
	});

	/**
	 * The first time the layer is rendered it is rendered with opacity 1.
	 */
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

	// TODO: Found the correct equation to minimize the layer flickering
	function flickeringDelay(dotsOnScreen: number) {
		return dotsOnScreen * 0.0025 + 60;
	}

	function createMaskLayer(coordinates: [number, number][], initialOpacity: number = 0) {
		// @ts-expect-error - maskCanvas is not typed
		const maskLayer = window.L.TileLayer.maskCanvas({
			radius: radius || 1,
			noMask: true,
			useAbsoluteRadius: true,
			color: color,
			lineColor: lineColor,
			opacity: opacity || initialOpacity
		});

		maskLayer.setData(coordinates);
		layerGroup!.addLayer(maskLayer);
		toggleLayers(flickeringDelay(coordinates.length));
	}

	/**
	 * Mounting a layer with a lot of coordinates takes time, so when the layer are toggled looks bad.
	 * The trick here is to wait the new layer to be mounted but with opacity 0, so it invisible
	 * and then swap the opacity between the layers and remove the old one.
	 * This minimizes the flickering.
	 */
	function toggleLayers(delay: number) {
		const layers = layerGroup!.getLayers();

		if (layers.length <= 1) return;

		// Remove old layer with a delay to prevent flickering
		setTimeout(() => {
			const [oldLayer, newLayer] = layers as [TileLayer, TileLayer];

			oldLayer.setOpacity(0);
			newLayer.setOpacity(opacity || 1);

			layerGroup!.removeLayer(oldLayer);
		}, delay);
	}
</script>
