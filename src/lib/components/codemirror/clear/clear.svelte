<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { RotateCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';

	interface Props extends HTMLButtonAttributes {
		onClear?: () => void;
	}

	const { onClear, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(contextKey);

	function clearData() {
		if (confirm('Está seguro que desea borrar los datos?')) {
			environment.clear();

			toast.success('Datos borrados correctamente.');

			if (onClear) {
				onClear();
			}
		}
	}
</script>

<Button size="icon" onclick={clearData} aria-label="Borrar datos" title="Borrar datos" {...rest}>
	<RotateCcw />
</Button>
