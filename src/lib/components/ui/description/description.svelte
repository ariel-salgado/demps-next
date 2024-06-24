<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		children: Snippet;
	}

	let { children, class: className, ...props }: Props = $props();
</script>

<p class={cn('text-sm text-slate-600', className)} {...props}>
	{@render children()}
</p>
