<script lang="ts">
	import type { Snippet } from 'svelte';

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
		class={`rounded-sm py-2 transition-colors focus-within:bg-slate-500 hover:bg-slate-500 ${isDragging ? 'cursor-col-resize' : 'cursor-ew-resize'}`}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="7" height="18">
			<path d="M2 0h3v3H2zm0 5h3v3H2zm0 5h3v3H2zm0 5h3v3H2z" class="fill-slate-400" />
		</svg>
	</div>
{/snippet}

<div
	class={`isolate flex size-full ${isDragging ? 'cursor-col-resize' : ''}`}
	style="max-height: {innerHeight! - (container?.getBoundingClientRect().top || 0) - 1}px"
	bind:this={container}
>
	<!-- Left screen -->
	<div
		class={`z-0 w-2/3 min-w-96 overflow-y-auto ${isDragging && 'pointer-events-none select-none'}`}
		bind:this={leftSide}
	>
		{@render left()}
	</div>

	<!-- Resizer -->
	<div class="z-10 flex h-full w-2 flex-col justify-around bg-slate-600">
		{@render resizer()}
		{@render resizer()}
		{@render resizer()}
	</div>

	<!-- Right screen -->
	<div
		class={`z-0 min-w-96 flex-1 overflow-y-auto ${isDragging && 'pointer-events-none select-none'}`}
	>
		{@render right()}
	</div>
</div>
