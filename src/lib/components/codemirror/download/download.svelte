<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Download } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';

	interface Props extends HTMLAnchorAttributes {
		download?: string;
	}

	const { download: download = 'data', ...rest }: Props = $props();

	const { editor } = getContext<EditorContext>(contextKey);

	let URLdata: string | null = $state(null);

	function downloadGeoJSON() {
		try {
			const data = JSON.parse(editor.state.doc.toString());

			if (data.features.length > 0) {
				const convertedData =
					'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
				URLdata = 'data:' + convertedData;
				toast.success('Datos exportados correctamente');
			} else {
				toast.error('No hay datos para exportar');
			}
		} catch {
			toast.error('Error al exportar los datos');
			throw new Error('Error al exportar los datos');
		}
	}
</script>

<Button
	as="a"
	size="icon"
	href={URLdata}
	download={`${download}.geojson`}
	onclick={downloadGeoJSON}
	tabindex={0}
	role="button"
	title="Descargar archivo"
	aria-label="Descargar GeoJSON"
	data-sveltekit-preload-data="off"
	{...rest}
>
	<Download />
</Button>
