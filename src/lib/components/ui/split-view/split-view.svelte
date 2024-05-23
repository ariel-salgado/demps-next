<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		left: Snippet;
		right: Snippet;
	}

	let { left, right }: Props = $props();

	let leftSide: HTMLDivElement | undefined = $state();
	let container: HTMLDivElement | undefined = $state();

	let xPosition = $state(0);
	let leftWidth = $state(0);

	let isDragging = $state(false);

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

<!-- TODO: Add better styles -->
<!-- TODO: Expose width classes as props -->

<svelte:body class={`${isDragging && 'cursor-col-resize'}`} />

<div class="isolate flex size-full" bind:this={container}>
	<div
		class={`z-0 w-2/3 min-w-80 ${isDragging && 'pointer-events-none select-none'}`}
		bind:this={leftSide}
	>
		{@render left()}
	</div>

	<div class="relative z-10 flex h-full w-1 flex-col justify-center bg-neutral-300">
		<div
			class={`absolute -left-1 h-20 w-3 cursor-ew-resize rounded-md bg-neutral-600 ${isDragging && 'cursor-col-resize'}`}
			onmousedowncapture={mouseDownHandler}
			role="button"
			tabindex="0"
		></div>
	</div>

	<div class={`z-0 min-w-80 flex-1 ${isDragging && 'pointer-events-none select-none'}`}>
		{@render right()}
	</div>
</div>
