<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, class: className, ...props }: Props = $props();
</script>

<div
	class={cn(
		'rounded-md py-3.5 px-5 transition-colors *:mt-2 focus-within:bg-slate-50 hover:bg-slate-50 has-[.error]:bg-red-600/10 has-[.error]:focus-within:bg-red-600/10 has-[.error]:hover:bg-red-600/10 has-[input:read-only]:bg-slate-100 has-[select:disabled]:bg-slate-100',
		className
	)}
	{...props}
>
	{@render children()}
</div>
