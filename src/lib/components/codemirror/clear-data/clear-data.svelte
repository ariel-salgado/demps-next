<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { RotateCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { editorContextKey } from '$lib/components/codemirror';

	interface Props extends HTMLButtonAttributes {
		onClear?: () => void;
	}

	const { onClear, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(editorContextKey);

	function clearData() {
		if (!confirm('Está seguro que desea borrar los datos?')) return;

		environment.clear();
		toast.success('Datos borrados correctamente.');

		if (!onClear) return;

		onClear();
	}
</script>

<Button
	variant="outline"
	size="icon"
	onclick={clearData}
	aria-label="Borrar datos"
	title="Borrar datos"
	{...rest}
>
	<RotateCcw />
</Button>
