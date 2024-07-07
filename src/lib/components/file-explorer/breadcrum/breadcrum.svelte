<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { getPathUpTo } from '$lib/utils';
	import { Button } from '$lib/components/ui';

	interface Props {
		currentDirectory: string;
		directoryTree: string[];
		formAction: string;
	}

	let { currentDirectory = $bindable(), directoryTree = $bindable(), formAction }: Props = $props();

	const handleSubmit: SubmitFunction = async () => {
		return async ({ result }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error', {
					description: 'Ocurrió un error al conectar con el servidor.'
				});
				return;
			}

			if ('currentDirectory' in result.data && 'directoryTree' in result.data) {
				currentDirectory = result.data.currentDirectory || currentDirectory;
				directoryTree = result.data.directoryTree || directoryTree;
				return;
			}

			toast.error('Error', {
				description: 'Ocurrió un error al obtener los subdirectorios de la ruta seleccionada.'
			});
		};
	};
</script>

<div class="flex items-center gap-x-2 py-1.5 px-4">
	{#each currentDirectory.split('/') as dir, i}
		{#if dir}
			<form method="POST" action={formAction} use:enhance={handleSubmit}>
				<input type="hidden" name="directory" value={getPathUpTo(currentDirectory, dir)} />
				<Button
					type="submit"
					class="px-0 text-base text-slate-500 transition-colors hover:text-slate-900"
					variant="link"
				>
					{dir}
				</Button>

				{#if i !== 0}
					<span class="text-slate-500">/</span>
				{/if}
			</form>
		{/if}
	{/each}
</div>
