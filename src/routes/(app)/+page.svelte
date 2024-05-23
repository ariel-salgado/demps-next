<script lang="ts">
	import { env } from '$lib/states';
	import { Map } from '$lib/components/leaflet';
	import { SplitView } from '$lib/components/ui';
	import { Editor } from '$lib/components/codemirror';

	const zoom = 15;
	const center: [number, number] = [-33.015348, -71.550002];
</script>

<svelte:head>
	<title>DEMPS | Environment</title>
	<meta name="description" content="Environment" />
</svelte:head>

<section class="size-full">
	<SplitView>
		{#snippet left()}
			<Map {center} {zoom} environment={env} />
		{/snippet}
		{#snippet right()}
			<Editor environment={env} />
		{/snippet}
	</SplitView>
</section>
