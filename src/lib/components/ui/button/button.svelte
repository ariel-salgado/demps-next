<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Variants, Sizes } from './props';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { baseStyle, variants, sizes } from './props';

	type ButtonOrLinkProps =
		| (HTMLButtonAttributes & { as?: 'button' })
		| (HTMLAnchorAttributes & { as: 'a' });

	type Props = {
		children: Snippet;
		variant?: Variants;
		size?: Sizes;
	} & ButtonOrLinkProps;

	let {
		children,
		variant = 'primary',
		size = 'default',
		class: className,
		...rest
	}: Props = $props();
</script>

{#if rest.as === 'a'}
	<a class={cn(baseStyle, variants[variant], sizes[size], className)} {...rest}>
		{@render children()}
	</a>
{:else}
	<button type="button" class={cn(baseStyle, variants[variant], sizes[size], className)} {...rest}>
		{@render children()}
	</button>
{/if}
