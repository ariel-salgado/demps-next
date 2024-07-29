<script lang="ts">
	import type { FeatureCollection } from 'geojson';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Database } from 'lucide-svelte';
	import { preprocessGeoJSON } from '$lib/utils';
	import { PUBLIC_SIM_DIR } from '$env/static/public';
	import { Button, Dialog } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';
	import { Explorer } from '$lib/components/file-explorer';

	interface Props extends HTMLButtonAttributes {
		onLoad?: () => void;
	}

	const { onLoad, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(contextKey);

	let showDialog: boolean = $state(false);
	let selectedFile: null | string = $state(null);

	async function loadData() {
		const response = await fetch('/api/file/get', {
			method: 'POST',
			body: JSON.stringify({ path: selectedFile }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, data } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			showDialog = false;
			return;
		}

		try {
			const loadedData = preprocessGeoJSON(JSON.parse(data) as FeatureCollection);

			if (!loadedData) {
				toast.error('Archivo de configuración inválido');
				return;
			}

			environment.value = loadedData;

			// TODO: This doesnt change the value on the parameters page
			// parameters.value.input = { ...parameters.value.input, zones: selectedFile! };

			if (onLoad) {
				onLoad();
			}

			toast.success('Configuración válida', {
				description: 'Archivo de configuración de zonas cargado exitosamente.'
			});
		} catch (error) {
			toast.error('Archivo de configuración inválido', {
				description: (error as Error).message
			});
		} finally {
			selectedFile = null;
			showDialog = false;
		}
	}
</script>

<Dialog bind:show={showDialog}>
	<Explorer
		isFile={true}
		directory={PUBLIC_SIM_DIR}
		extensions={['.geojson']}
		includeFolders={false}
		bind:selected={selectedFile}
		onSelected={loadData}
	/>
</Dialog>

<Button
	variant="outline"
	size="icon"
	title="Cargar archivo"
	aria-label="Cargar archivo desde el servidor"
	onclick={() => (showDialog = true)}
	{...rest}
>
	<Database />
</Button>
