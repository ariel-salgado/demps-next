<script lang="ts">
	import { env } from '$lib/states';
	import { Map } from '$lib/components/leaflet';
	import { Editor } from '$lib/components/codemirror';

	const zoom = 15;
	const center: [number, number] = [-33.015348, -71.550002];
</script>

<svelte:head>
	<title>DEMPS | Environment</title>
	<meta name="description" content="Environment" />
</svelte:head>

<section class="inline-grid size-full grid-flow-col grid-cols-[1fr_auto]">
	<Map {center} {zoom} environment={env} />
	<Editor environment={env} />
</section>
