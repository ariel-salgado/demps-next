<script lang="ts">
	import type { MapContext } from '$lib/components/leaflet';

	import { getContext, onMount } from 'svelte';
	import { contextKey } from '$lib/components/leaflet';

	const { map } = getContext<MapContext>(contextKey);

	onMount(async () => {
		const { GeoSearchControl, OpenStreetMapProvider } = await import('leaflet-geosearch');
		await import('leaflet-geosearch/dist/geosearch.css');

		const search = GeoSearchControl({
			provider: new OpenStreetMapProvider(),
			style: 'bar',
			autoClose: true,
			showMarker: false,
			searchLabel: 'Buscar una dirección',
			notFoundMessage: 'No se encontraron resultados'
		});

		map.addControl(search);

		document.querySelector('.leaflet-geosearch-button form input')?.setAttribute('name', 'search');
		document
			.querySelector('.leaflet-control-container')
			?.lastElementChild?.classList.add('!absolute', 'top-0', 'left-14', '!max-w-[300px]');
	});
</script>
