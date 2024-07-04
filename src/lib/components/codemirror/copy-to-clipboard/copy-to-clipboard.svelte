<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';
	import { ClipboardCopy, ClipboardCheck } from 'lucide-svelte';

	interface Props extends HTMLButtonAttributes {
		timeout?: number;
	}

	const { timeout = 1500, ...rest }: Props = $props();

	const { editor } = getContext<EditorContext>(contextKey);

	let copied: boolean | null = $state(false);

	function copyToClipboard() {
		if (!editor) {
			toast.error('Error al copiar al portapapeles.');
			return;
		}

		navigator.clipboard.writeText(editor.state.doc.toString()).then(() => {
			copied = true;
			toast.success('Copiado al portapapeles.');
			const cleanup = setTimeout(() => {
				copied = false;
			}, timeout);

			clearTimeout(cleanup);
		});
	}

	onDestroy(() => {
		copied = null;
	});
</script>

<Button
	variant="outline"
	size="icon"
	onclick={copyToClipboard}
	title="Copiar"
	aria-label="Copiar al portapapeles"
	{...rest}
>
	{#if !copied}
		<ClipboardCopy />
	{:else}
		<ClipboardCheck />
	{/if}
</Button>
