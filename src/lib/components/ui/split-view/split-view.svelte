<script lang="ts">
	import type { Snippet } from 'svelte';

	import { EllipsisVertical } from 'lucide-svelte';

	interface Props {
		left: Snippet;
		right: Snippet;
	}

	let { left, right }: Props = $props();

	let xPosition = $state(0);
	let leftWidth = $state(0);
	let innerHeight = $state(0);

	let isDragging = $state(false);

	let leftSide: HTMLDivElement | undefined = $state();
	let container: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (isDragging) {
			document.addEventListener('mouseup', mouseUpHandler);
			document.addEventListener('mousemove', mouseMoveHandler);
		} else {
			document.removeEventListener('mouseup', mouseUpHandler);
			document.removeEventListener('mousemove', mouseMoveHandler);
		}
	});

	function mouseDownHandler(e: MouseEvent) {
		isDragging = true;
		xPosition = e.clientX;
		leftWidth = leftSide!.getBoundingClientRect().width!;
	}

	function mouseMoveHandler(e: MouseEvent) {
		const dx = e.clientX - xPosition;
		const newLeftWidth = ((leftWidth + dx) * 100) / container!.getBoundingClientRect().width;
		leftSide!.style.width = `${newLeftWidth}%`;
	}

	function mouseUpHandler() {
		isDragging = false;
	}
</script>

<!-- ?: Add button to close right side panel -->

<svelte:window bind:innerHeight />

{#snippet resizer()}
	<div
		role="button"
		tabindex="-1"
		aria-label="Resize"
		onmousedown={mouseDownHandler}
		class={`self-center rounded-sm py-2 transition-colors focus-within:bg-slate-500 hover:bg-slate-500 ${isDragging ? 'cursor-col-resize' : 'cursor-ew-resize'}`}
	>
		<EllipsisVertical class="stroke-slate-300" />
	</div>
{/snippet}

<div
	class={`flex size-full ${isDragging ? 'cursor-col-resize' : ''}`}
	style="max-height: {innerHeight! - (container?.getBoundingClientRect().top || 0) - 1}px"
	bind:this={container}
>
	<!-- Left screen -->
	<div
		class={`w-2/3 min-w-96 overflow-y-auto ${isDragging && 'pointer-events-none select-none'}`}
		bind:this={leftSide}
	>
		{@render left()}
	</div>

	<!-- Resizer -->
	<div class="flex h-full w-2 flex-col justify-around bg-slate-600">
		{@render resizer()}
		{@render resizer()}
		{@render resizer()}
	</div>

	<!-- Right screen -->
	<div class={`min-w-96 flex-1 overflow-y-auto ${isDragging && 'pointer-events-none select-none'}`}>
		{@render right()}
	</div>
</div>
