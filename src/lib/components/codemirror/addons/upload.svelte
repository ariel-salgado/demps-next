<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { Upload } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';
	import { isValidGeoJSON, preprocessGeoJSON } from '$lib/utils';

	interface Props extends HTMLButtonAttributes {
		accept: string;
		files: FileList | null;
		onUpload?: () => void;
	}

	let { accept, files = $bindable(), onUpload, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(contextKey);

	function handleUpload(e: Event) {
		if (!!files && files.length > 0) {
			const reader = new FileReader();

			reader.onload = () => {
				const data = reader.result as string;

				try {
					if (isValidGeoJSON(data)) {
						const geojson = preprocessGeoJSON(data);

						if (!geojson) {
							throw new Error('Archivo GeoJSON inválido.');
						}

						environment.clear();
						environment.addFeatures(geojson);

						(e.target as HTMLInputElement).value = '';

						if (onUpload) {
							onUpload();
						}
					}
				} catch {
					alert('Archivo GeoJSON inválido.');
				}
			};

			const file = files[0] as File;
			const blob = new Blob([file], { type: file.type });

			reader.readAsText(blob);
		}
	}
</script>

<Button class="p-0" size="icon" {...rest}>
	<label class="flex size-full cursor-pointer items-center justify-center p-1.5" for="fileUpload">
		<Upload />
	</label>

	<input id="fileUpload" type="file" class="hidden" {accept} bind:files onchange={handleUpload} />
</Button>
