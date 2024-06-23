<script lang="ts">
	import type { Layer } from 'leaflet';
	import type { MapContext } from '$lib/components/leaflet';

	import { uniquePool } from '$lib/states';
	import { mapContextKey } from '$lib/components/leaflet';
	import { getContext, onMount, untrack, tick } from 'svelte';

	interface Props {
		coordinates: [number, number][];
	}

	let { coordinates }: Props = $props();

	const { map } = getContext<MapContext>(mapContextKey);

	let mounted: boolean = $state(false);

	$effect(() => {
		if (mounted) {
			coordinates;
			untrack(async () => await createMaskLayer(coordinates));
		}
	});

	onMount(async () => {
		// @ts-expect-error - maskCanvas is not recognized
		await import('leaflet-maskcanvas');

		await createMaskLayer(coordinates);

		mounted = true;
	});

	async function createMaskLayer(coordinates: [number, number][]) {
		// @ts-expect-error - maskCanvas is not recognized
		const maskLayer = window.L.TileLayer.maskCanvas({
			radius: 1,
			useAbsoluteRadius: true,
			color: '#7E4BB9',
			opacity: 1,
			noMask: true,
			lineColor: '#6A3D9E'
		});

		maskLayer.setData(coordinates);

		map.addLayer(maskLayer);

		await tick();

		if (uniquePool.has('maskLayer')) {
			setTimeout(() => {
				map.removeLayer(uniquePool.pop<Layer>('maskLayer')!);
				uniquePool.add('maskLayer', maskLayer);
			}, 50);
		} else {
			uniquePool.add('maskLayer', maskLayer);
		}
	}
</script>
