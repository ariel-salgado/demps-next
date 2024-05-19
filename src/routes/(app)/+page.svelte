<script lang="ts">
	import { env } from '$lib/states';
	import { Map } from '$lib/components/leaflet';

	const zoom = 15;
	const center: [number, number] = [-33.015348, -71.550002];
</script>

<svelte:head>
	<title>DEMPS | Environment</title>
	<meta name="description" content="Environment" />
</svelte:head>

<section class="h-full">
	<Map {center} {zoom} environment={env} />
</section>
