<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { joinPath } from '$lib/utils';
	import { Button } from '$lib/components/ui';
	import { File, Folder, CornerUpLeft, Trash2, CircleCheckBig, Circle } from 'lucide-svelte';

	interface Props {
		path: string;
		files?: string[];
		folders?: string[];
		directory: string;
		selected?: string | null;
		includeFiles?: boolean;
		includeFolders?: boolean;
		onSelected?: () => void;
	}

	let {
		path,
		files = $bindable(),
		folders = $bindable(),
		directory = $bindable(),
		selected = $bindable(),
		includeFiles = true,
		includeFolders = true,
		onSelected
	}: Props = $props();

	function handleBrowsing() {
		directory = joinPath(directory, path);
	}

	function handleSelected() {
		selected = joinPath(directory, path);

		if (folders) {
			directory = joinPath(directory, path);
		}

		if (onSelected) {
			onSelected();
		}
	}

	async function handleDelete() {
		const deleteConfirmation = confirm(
			`¿Está seguro de eliminar este ${folders ? 'directorio' : 'archivo'}?`
		);

		if (!deleteConfirmation) return;

		const deletePath = joinPath(directory, path);

		const response = await fetch('/api/directory/delete', {
			method: 'DELETE',
			body: JSON.stringify({ path: deletePath }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, deleted } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			return;
		}

		if (folders) {
			folders.filter((folder) => folder !== path);
		} else if (files) {
			files.filter((file) => file !== path);
		}
		toast.success('Eliminado', {
			description: `El ${folders ? 'directorio' : 'archivo'} ${deleted} ha sido eliminado`
		});
	}
</script>

<div
	class="group flex h-10 items-center justify-between gap-x-2 transition-colors hover:bg-slate-50"
>
	<!-- Folder or File -->
	{#if path === '..'}
		<button class="inline-flex cursor-pointer items-center gap-x-1.5 px-4" onclick={handleBrowsing}>
			<CornerUpLeft class="size-4" />
			<span>{path}</span>
		</button>
	{:else if folders}
		<button class="inline-flex cursor-pointer items-center gap-x-1.5 px-4" onclick={handleBrowsing}>
			<Folder class="size-4 fill-slate-300" />
			<span>{path}</span>
		</button>
		{#if includeFolders}
			{@render actions()}
		{/if}
	{:else if files}
		<button class="inline-flex cursor-pointer items-center gap-x-1.5 px-4">
			<File class="size-4" />
			<span>{path}</span>
		</button>
		{#if includeFiles}
			{@render actions()}
		{/if}
	{/if}
</div>

{#snippet actions()}
	<div
		class="flex items-center gap-x-2 px-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
	>
		<Button variant="outline" size="sm" onclick={handleSelected}>
			{#if selected === joinPath(directory, path)}
				<CircleCheckBig class="mr-1.5 size-4" />
				<span>Seleccionado</span>
			{:else}
				<Circle class="mr-1.5 size-4" />
				<span>Seleccionar</span>
			{/if}
		</Button>

		<Button size="sm" onclick={handleDelete}>
			<Trash2 class="mr-1.5 size-4" />
			<span>Eliminar</span>
		</Button>
	</div>
{/snippet}
