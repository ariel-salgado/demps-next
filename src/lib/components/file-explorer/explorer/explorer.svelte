<script lang="ts">
	import type { FetchDirectoryOptions } from '$lib/types';

	import { toast } from 'svelte-sonner';
	import { joinPath } from '$lib/utils';
	import { FolderPlus } from 'lucide-svelte';
	import { Button, Input } from '$lib/components/ui';
	import { Breadcrumb, Item } from '$lib/components/file-explorer';

	type Props = {
		basePath?: string;
		directory: string;
		selected: string | null;
		isFile?: boolean | null;
		onSelected?: () => void;
		disableBacktracking?: boolean;
	} & FetchDirectoryOptions;

	let {
		basePath,
		directory = $bindable(),
		selected = $bindable(),
		isFile = $bindable(null),
		onSelected,
		includeFiles = true,
		includeFolders = true,
		extensions = null,
		disableBacktracking = false
	}: Props = $props();

	let files: string[] = $state([]);
	let folders: string[] = $state([]);

	let directoryToCreate: string | null = $state(null);

	$effect(() => {
		fetchDirectory(directory, { extensions, includeFiles, includeFolders });
	});

	async function fetchDirectory(
		path: string,
		options: FetchDirectoryOptions = {
			extensions,
			includeFiles,
			includeFolders
		}
	) {
		const response = await fetch('/api/directory/get', {
			method: 'POST',
			body: JSON.stringify({ path, options }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, contents } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			return;
		}

		files = contents.files;
		folders = contents.folders;
	}

	async function createDirectory() {
		if (!directoryToCreate) {
			toast.error('Error', {
				description: 'Por favor, ingrese un nombre para el directorio a crear'
			});
			return;
		}

		const path = joinPath(directory, directoryToCreate!);

		const response = await fetch('/api/directory/create', {
			method: 'POST',
			body: JSON.stringify({ path }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, created } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			return;
		}

		folders.push(directoryToCreate);
		directoryToCreate = null;

		toast.success('Creado', {
			description: `El directorio ${created} ha sido creado`
		});
	}
</script>

<div class="flex size-full flex-col gap-y-2 bg-white p-6">
	<h2 class="text-3xl font-bold">Seleccionar {`${includeFolders ? 'directorio' : 'archivo'}`}</h2>

	<div class="flex w-full items-center justify-between">
		<Breadcrumb bind:directory {basePath} {disableBacktracking} />
		<div class="flex gap-x-1.5">
			<Input class="h-8" placeholder="Crear directorio" bind:value={directoryToCreate} />
			<Button size="icon" onclick={createDirectory}>
				<FolderPlus />
			</Button>
		</div>
	</div>

	<div class="divide-y divide-slate-300 overflow-scroll rounded-xl border border-slate-300">
		{#if directory.split('/').length > 4 && directory.length > (basePath?.length || 0) && !disableBacktracking}
			<Item bind:directory path={'..'} />
		{/if}
		{#each folders as folder}
			<Item
				bind:directory
				bind:folders
				bind:selected
				bind:isFile
				path={folder}
				{onSelected}
				{includeFolders}
				{includeFiles}
			/>
		{/each}

		{#each files as file}
			<Item
				bind:directory
				bind:files
				bind:selected
				bind:isFile
				path={file}
				{onSelected}
				{includeFolders}
				{includeFiles}
			/>
		{/each}
	</div>
</div>
