<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { cn, getPathUpTo } from '$lib/utils';

	interface Props {
		basePath?: string;
		directory: string;
		disableBacktracking?: boolean;
	}

	let { basePath, directory = $bindable(), disableBacktracking = false }: Props = $props();

	function handleSelectedPath(dir: string) {
		directory = getPathUpTo(directory, dir) as string;
	}
</script>

<div class="flex items-center gap-x-1.5 px-1.5">
	<span class="text-slate-500">/</span>
	{#each directory.split('/') as dir, index}
		{@const canBacktrack = basePath ? !(basePath.split('/').at(index) === dir) : true}
		{#if dir}
			<Button
				variant="link"
				class={cn(
					'px-0 text-base text-slate-500 transition-colors hover:text-slate-900',
					!canBacktrack || disableBacktracking
						? 'cursor-default hover:text-slate-500 hover:no-underline'
						: ''
				)}
				onclick={() => {
					if (canBacktrack && !disableBacktracking) {
						handleSelectedPath(dir);
					}
				}}
			>
				{dir}
			</Button>
			<span class="text-slate-500">/</span>
		{/if}
	{/each}
</div>
