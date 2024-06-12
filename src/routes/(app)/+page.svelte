<script lang="ts">
	import { environment } from '$lib/states';
	import { SplitView } from '$lib/components/ui';
	import { Map, Draw } from '$lib/components/leaflet';
	import { Editor, Upload } from '$lib/components/codemirror';

	// TODO: Make the reload strategy better
	// TODO: Make the minimal changes when updating the map and the editor

	const zoom: number = 15;
	const center: [number, number] = [-33.015348, -71.550002];

	let reload: boolean = $state(false);
	let files: FileList | null = $state(null);

	function onUpload() {
		reload = true;
	}
</script>

<svelte:head>
	<title>DEMPS | Environment</title>
	<meta name="description" content="Environment" />
</svelte:head>

<section class="size-full">
	<SplitView>
		{#snippet left()}
			<Map {center} {zoom} {environment} bind:reloadOn={reload}>
				<Draw />
			</Map>
		{/snippet}
		{#snippet right()}
			<Editor {environment} onChanges={onUpload}>
				<Upload accept=".geojson" {files} {onUpload} />
			</Editor>
		{/snippet}
	</SplitView>
</section>
