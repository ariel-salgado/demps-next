<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { X } from 'lucide-svelte';
	import { clickOutside } from '$lib/utils';
	import { fade, scale } from 'svelte/transition';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		show: boolean;
		children: Snippet;
		onClose?: () => void;
	}

	let { show = $bindable(false), children, onClose, class: className, ...props }: Props = $props();

	let displayed: boolean = $state(false);

	$effect(() => {
		if (show) {
			document.body.style.overflow = 'hidden';
			displayed = true;
		} else {
			document.body.style.overflow = '';
			if (onClose && displayed) {
				displayed = false;
				onClose();
			}
		}
	});
</script>

{#if show}
	<div class="fixed inset-0 z-[9999] size-full content-center bg-slate-700/80" transition:fade>
		<div
			class={cn(
				'relative mx-auto size-[80%] overflow-scroll rounded-lg bg-white p-4 shadow-lg',
				className
			)}
			{...props}
			transition:scale
			use:clickOutside={() => (show = false)}
		>
			<button
				class="absolute top-3 right-3 size-8 cursor-pointer content-center rounded-full hover:bg-slate-100"
				onclick={() => (show = false)}
			>
				<X class="mx-auto size-6" />
			</button>
			{@render children()}
		</div>
	</div>
{/if}
