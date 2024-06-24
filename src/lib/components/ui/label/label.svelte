<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	interface Props extends HTMLLabelAttributes {
		children: Snippet;
	}

	const { children, class: className, ...rest }: Props = $props();
</script>

<label
	class={cn(
		'text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
		className
	)}
	{...rest}
>
	{@render children()}
</label>
