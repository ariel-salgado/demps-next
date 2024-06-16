<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { EditorContext } from '$lib/components/codemirror';

	import { getContext } from 'svelte';
	import { RotateCcw } from 'lucide-svelte';
	import { Button } from '$lib/components/ui';
	import { contextKey } from '$lib/components/codemirror';

	interface Props extends HTMLButtonAttributes {
		onClear?: () => void;
	}

	const { onClear, ...rest }: Props = $props();

	const { environment } = getContext<EditorContext>(contextKey);

	function clearData() {
		environment.clear();

		if (onClear) {
			onClear();
		}
	}
</script>

<Button size="icon" onclick={clearData} aria-label="Clear data" {...rest}>
	<RotateCcw />
</Button>
