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

		const searchContainer = document.querySelector('.leaflet-control-container')
			?.lastElementChild as HTMLElement;
		const seachInput = searchContainer.children[0].firstChild as HTMLInputElement;
		const clearSearch = searchContainer.children[0].children[1] as HTMLButtonElement;

		searchContainer?.classList.add('!absolute', 'top-0', 'left-14', '!max-w-[300px]');
		seachInput.classList.add('placeholder:text-neutral-950');
		clearSearch.classList.add('text-lg', '!font-normal');
	});
</script>
