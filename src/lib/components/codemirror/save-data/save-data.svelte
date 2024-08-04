<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { Save } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { PUBLIC_SIM_DIR } from '$env/static/public';
	import { Button, Dialog } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';
	import { Explorer } from '$lib/components/file-explorer';

	interface Props extends HTMLButtonAttributes {
		extension?: string;
		onSave?: (selectedFile: string) => void;
	}

	const { extension, onSave, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(contextKey);

	let showDialog: boolean = $state(false);
	let selectedFile: string | null = $state(null);
	let currentDirectory: string = $state(PUBLIC_SIM_DIR);

	async function saveData() {
		const data = JSON.stringify(environment.value);
		const fileName = selectedFile?.split('/').filter(Boolean).pop();

		const response = await fetch('/api/file/create', {
			method: 'POST',
			body: JSON.stringify({
				data,
				fileName,
				path: currentDirectory
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			return;
		}

		showDialog = false;

		toast.success('Creado', {
			description: `Se guardado la configuración en ${fileName}.`
		});

		if (onSave) {
			onSave(selectedFile!);
		}
	}
</script>

<Dialog bind:show={showDialog}>
	<Explorer
		isFile={true}
		bind:directory={currentDirectory}
		bind:selected={selectedFile}
		extensions={extension ? [extension] : null}
		includeFolders={false}
		onSelected={saveData}
		saveFileExtension={'.geojson'}
		enableCreateFile={true}
	/>
</Dialog>

<Button
	variant="outline"
	size="icon"
	title="Guardar archivo"
	aria-label="Guardar archivo en el servidor"
	onclick={() => (showDialog = true)}
	{...rest}
>
	<Save />
</Button>
