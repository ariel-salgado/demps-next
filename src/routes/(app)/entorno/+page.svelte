<script lang="ts">
	import { createPersisted, environment, parameters } from '$lib/states';
	import { SplitView } from '$lib/components/ui';
	import { Map, ToggleLayers, Geoman, Geosearch } from '$lib/components/leaflet';
	import {
		Editor,
		SaveData,
		LoadData,
		ClearData,
		UploadFile,
		DownloadFile,
		CopyToClipboard
	} from '$lib/components/codemirror';

	let reload: boolean = $state(false);
	let files: FileList | null = $state(null);

	let zoneFile = createPersisted('zone', parameters.value.input?.zones);

	function triggerFullReload() {
		reload = true;
	}

	function handleOnLoadedFile(selectedFile: string) {
		zoneFile.value = selectedFile;
		triggerFullReload();
	}
</script>

<svelte:head>
	<title>DEMPS | Environment</title>
	<meta name="description" content="Environment" />
</svelte:head>

<section class="isolate size-full">
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
				<SaveData extension=".geojson" />
				<LoadData onLoad={(selectedFile) => handleOnLoadedFile(selectedFile)} />
				<ClearData onClear={triggerFullReload} />
				<UploadFile accept=".geojson" {files} onUpload={triggerFullReload} />
			</Editor>
		{/snippet}
	</SplitView>

	{#if zoneFile.value}
		<span
			class="absolute bottom-0 left-0 rounded-tr-lg border border-t-slate-500 border-r-slate-500 border-b-transparent border-l-transparent bg-white py-0.5 px-3 text-sm"
			>Editando: {zoneFile.value}</span
		>
	{/if}
</section>
