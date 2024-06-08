<script lang="ts">
	import type { Sizes } from '.';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { sizes, defaultStyle } from '.';

	type ButtonOrLinkProps =
		| (HTMLButtonAttributes & { as?: 'button' })
		| (HTMLAnchorAttributes & { as: 'a' });

	type Props = {
		children: Snippet;
		size?: Sizes;
	} & ButtonOrLinkProps;

	let { children, size = 'default', class: className, ...rest }: Props = $props();
</script>

{#if rest.as === 'a'}
	<a {...rest}>
		{@render children()}
	</a>
{:else}
	<button type="button" class={cn(defaultStyle, sizes[size], className)} {...rest}>
		{@render children()}
	</button>
{/if}
