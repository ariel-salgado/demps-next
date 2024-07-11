<script lang="ts">
	import { environment } from '$lib/states';
	import { SplitView } from '$lib/components/ui';
	import { Map, ToggleLayers, Geoman, Geosearch } from '$lib/components/leaflet';
	import {
		Editor,
		ClearData,
		UploadFile,
		DownloadFile,
		CopyToClipboard
	} from '$lib/components/codemirror';

	let reload: boolean = $state(false);
	let files: FileList | null = $state(null);

	function triggerFullReload() {
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
			<Map {environment} bind:reload isLayerEditable>
				<Geoman />
				<Geosearch />
				<ToggleLayers />
			</Map>
		{/snippet}
		{#snippet right()}
			<Editor {environment} onChanges={triggerFullReload}>
				<DownloadFile />
				<CopyToClipboard />
				<ClearData onClear={triggerFullReload} />
				<UploadFile accept=".geojson" {files} onUpload={triggerFullReload} />
			</Editor>
		{/snippet}
	</SplitView>
</section>
