<script lang="ts">
	import { Button } from '$lib/components/ui';
	import { getPathUpTo } from '$lib/utils';

	interface Props {
		directory: string;
	}

	let { directory = $bindable() }: Props = $props();

	function handleSelectedPath(dir: string) {
		directory = getPathUpTo(directory, dir) as string;
	}
</script>

<div class="flex items-center gap-x-1.5 px-1.5">
	<span class="text-slate-500">/</span>
	{#each directory.split('/') as dir}
		{#if dir}
			<Button
				class="px-0 text-base text-slate-500 transition-colors hover:text-slate-900"
				variant="link"
				onclick={() => {
					handleSelectedPath(dir);
				}}
			>
				{dir}
			</Button>
			<span class="text-slate-500">/</span>
		{/if}
	{/each}
</div>
