<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';
	import { ClipboardCopy, ClipboardCheck } from 'lucide-svelte';

	interface Props extends HTMLButtonAttributes {
		timeout?: number;
	}

	const { timeout = 1500, ...rest }: Props = $props();

	const { editor } = getContext<EditorContext>(contextKey);

	let copied: boolean = $state(false);

	function copyToClipboard() {
		if (editor) {
			navigator.clipboard.writeText(editor.state.doc.toString()).then(() => {
				copied = true;
				setTimeout(() => {
					copied = false;
				}, timeout);
			});
		}
	}
</script>

<Button size="icon" onclick={copyToClipboard} aria-label="Copy to clipboard" {...rest}>
	{#if !copied}
		<ClipboardCopy />
	{:else}
		<ClipboardCheck />
	{/if}
</Button>
