<script lang="ts">
	import type { FetchDirectoryOptions } from '$lib/types';

	import { toast } from 'svelte-sonner';
	import { joinPath } from '$lib/utils';
	import { Button, Input } from '$lib/components/ui';
	import { FilePlus, FolderPlus } from 'lucide-svelte';
	import { Breadcrumb, Item } from '$lib/components/file-explorer';

	type Props = {
		basePath?: string;
		directory: string;
		isRelativeTo?: string;
		selected?: string | null;
		isFile?: boolean | null;
		onSelected?: () => void;
		disableBacktracking?: boolean;
		saveFileExtension?: string;
		enableCreateFile?: boolean;
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
		disableBacktracking = false,
		isRelativeTo,
		saveFileExtension,
		enableCreateFile = false
	}: Props = $props();

	let files: string[] = $state([]);
	let folders: string[] = $state([]);

	let fileToCreate: string | null = $state(null);
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
				description: error.message,
				action: {
					label: 'Crear directorio',
					onClick: () => {
						createDirectory('/');
						directory = '/' + directory.split('/').filter(Boolean).slice(0, -1).join('/') + '/';
					}
				}
			});
			return;
		}

		files = contents.files;
		folders = contents.folders;
	}

	async function createFile(pathToCreate: string | null) {
		if (!pathToCreate) {
			toast.error('Error', {
				description: 'Debe ingresar un nombre para el archivo a crear'
			});
			return;
		}

		const fileToCreate = !saveFileExtension
			? pathToCreate
			: pathToCreate.endsWith(saveFileExtension)
				? pathToCreate
				: `${pathToCreate}${saveFileExtension}`;

		const response = await fetch('/api/file/create', {
			method: 'POST',
			body: JSON.stringify({ data: '', fileName: fileToCreate, path: directory }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, path, fileName } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			return;
		}

		if (fileName) {
			files.push(fileName);
		}

		toast.success('Creado', {
			description: `El archivo ${fileName} ha sido creado en ${path}.`
		});
	}

	async function createDirectory(pathToCreate: string | null) {
		if (!pathToCreate) {
			toast.error('Error', {
				description: 'Debe ingresar un nombre para el directorio a crear'
			});
			return;
		}

		const path = joinPath(directory, pathToCreate!);

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

		if (pathToCreate !== '/') {
			folders.push(pathToCreate!);
		}

		toast.success('Creado', {
			description: `El directorio ${created} ha sido creado`
		});
	}
</script>

<div class="flex size-full flex-col gap-y-2 bg-white p-6">
	<h2 class="text-3xl font-bold">Seleccionar {`${includeFolders ? 'directorio' : 'archivo'}`}</h2>

	<div class="flex w-full items-center justify-between">
		<Breadcrumb bind:directory {basePath} {disableBacktracking} />

		<!-- Actions -->
		<div class="flex gap-x-6">
			{#if enableCreateFile}
				<div class="flex gap-x-1.5">
					<Input class="h-8" placeholder="Crear archivo" bind:value={fileToCreate} />
					<Button
						size="icon"
						onclick={() => {
							createFile(fileToCreate);
							fileToCreate = null;
						}}
					>
						<FilePlus />
					</Button>
				</div>
			{/if}
			<div class="flex gap-x-1.5">
				<Input class="h-8" placeholder="Crear directorio" bind:value={directoryToCreate} />
				<Button
					size="icon"
					onclick={() => {
						createDirectory(directoryToCreate);
						directoryToCreate = null;
					}}
				>
					<FolderPlus />
				</Button>
			</div>
		</div>
	</div>

	<div class="divide-y divide-slate-300 overflow-scroll rounded-xl border border-slate-300">
		{#if directory
			.split('/')
			.filter(Boolean).length > 2 && directory.length > (basePath?.length || 0) && !disableBacktracking}
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
				{isRelativeTo}
				{includeFiles}
				{includeFolders}
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
				{isRelativeTo}
				{includeFiles}
				{includeFolders}
			/>
		{/each}
	</div>
</div>
