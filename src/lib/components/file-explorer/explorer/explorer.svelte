<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';

	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { joinPath } from '$lib/utils';
	import { Button, Input } from '$lib/components/ui';
	import { Breadcrum } from '$lib/components/file-explorer';
	import { Folder, FolderPlus, CornerUpLeft, Circle, CircleCheckBig, Trash2 } from 'lucide-svelte';

	interface Props {
		currentDirectory: string;
		folderAction: string;
		deleteAction: string;
		selectedPath: string;
		onSelect?: () => void;
	}

	let {
		currentDirectory = $bindable(),
		folderAction,
		deleteAction,
		selectedPath = $bindable(),
		onSelect
	}: Props = $props();

	let initForm: HTMLButtonElement | undefined = $state();

	let directoryTree: string[] = $state([]);

	onMount(() => {
		initForm?.click();
	});

	const handleInit: SubmitFunction = async () => {
		return async ({ result }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error', {
					description: 'Ocurrió un error al conectar con el servidor.'
				});
				return;
			}

			if ('errorMessage' in result.data) {
				toast.error('Error', {
					description: result.data.errorMessage
				});
				return;
			}

			if ('directoryTree' in result.data) {
				directoryTree = result.data.directoryTree;
				return;
			}
		};
	};

	const handleSubmit: SubmitFunction = async () => {
		return async ({ result }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error', {
					description: 'Ocurrió un error al conectar con el servidor.'
				});
				return;
			}

			if ('errorMessage' in result.data) {
				toast.error('Error', {
					description: result.data.errorMessage
				});
				return;
			}

			if ('currentDirectory' in result.data && 'directoryTree' in result.data) {
				currentDirectory = result.data.currentDirectory;
				directoryTree = result.data.directoryTree;
				return;
			}
		};
	};

	const handleCreate: SubmitFunction = async () => {
		return async ({ result, formElement }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error', {
					description: 'Ocurrió un error al conectar con el servidor.'
				});
				return;
			}

			if ('errorMessage' in result.data) {
				toast.error('Error', {
					description: result.data.errorMessage
				});
				return;
			}

			if ('directoryTree' in result.data) {
				directoryTree = result.data.directoryTree;
				formElement.reset();
				toast.success('Directorio creado', {
					description: 'El directorio ha sido creado correctamente.'
				});
				return;
			}
		};
	};

	const handleDelete: SubmitFunction = async () => {
		return async ({ result }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error', {
					description: 'Ocurrió un error al conectar con el servidor.'
				});
				return;
			}

			if ('errorMessage' in result.data) {
				toast.error('Error', {
					description: result.data.errorMessage
				});
				return;
			}

			if ('deleted' in result.data) {
				directoryTree = directoryTree.filter((dir) => dir !== result.data?.deleted);
				toast.success('Directorio eliminado', {
					description: 'El directorio ha sido eliminado correctamente.'
				});
				return;
			}
		};
	};

	function confirmDelete(event: MouseEvent) {
		if (!confirm('¿Estás seguro de que deseas eliminar este directorio?')) {
			event.preventDefault();
		}
	}

	function handleSelect(path: string) {
		currentDirectory = path;
		selectedPath = path;

		if (onSelect) {
			onSelect();
		}
	}
</script>

<form class="hidden" method="POST" action={folderAction} use:enhance={handleInit}>
	<input type="hidden" name="directory" value={currentDirectory} />
	<button type="submit" class="hidden" bind:this={initForm}></button>
</form>

<div class="size-full bg-white p-6">
	<h2 class="text-3xl font-bold leading-normal">Seleccionar directorio</h2>

	<div class="mb-1 flex w-full justify-between">
		<Breadcrum bind:currentDirectory bind:directoryTree formAction={folderAction} />
		<form
			class="flex items-center gap-x-2"
			method="POST"
			action="?/createDirectory"
			use:enhance={handleCreate}
		>
			<input type="hidden" name="currentDirectory" value={currentDirectory} />
			<Input class="h-8" name="directory" placeholder="Nuevo directorio" />
			<Button type="submit" size="icon">
				<FolderPlus />
			</Button>
		</form>
	</div>

	<div class="divide-y divide-slate-300 overflow-scroll rounded-xl border border-slate-300">
		{#if currentDirectory.split('/').length > 2}
			{@const folder = '..'}
			<form
				class="flex h-10 items-center px-4 transition-colors hover:bg-slate-50"
				method="POST"
				action={folderAction}
				use:enhance={handleSubmit}
			>
				<input type="hidden" name="directory" value={joinPath(currentDirectory, folder)} />
				<button class="inline-flex size-full cursor-pointer items-center gap-x-1.5">
					<CornerUpLeft class="size-4" />
					<span>{folder}</span>
				</button>
			</form>
		{/if}
		{#each directoryTree as directory}
			{@const folder = directory.split('/').pop() as string}
			<div
				class="group flex h-10 items-center justify-between gap-x-2 pl-4 transition-colors hover:bg-slate-50"
			>
				<form class="flex-1" method="POST" use:enhance={handleSubmit}>
					<input type="hidden" name="directory" value={joinPath(currentDirectory, folder)} />
					<button
						type="submit"
						class="inline-flex size-full cursor-pointer items-center gap-x-1.5"
						formaction={folderAction}
					>
						<Folder class="size-4" />
						<span>{folder}</span>
					</button>
				</form>
				<div
					class="flex items-center gap-x-2 px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				>
					<div>
						<Button
							variant="outline"
							size="sm"
							onclick={() => handleSelect(joinPath(currentDirectory, folder))}
						>
							{#if selectedPath === joinPath(currentDirectory, folder)}
								<CircleCheckBig class="mr-1.5 size-4" />
								<span>Seleccionado</span>
							{:else}
								<Circle class="mr-1.5 size-4" />
								<span>Seleccionar</span>
							{/if}
						</Button>
					</div>
					<form method="POST" use:enhance={handleDelete}>
						<input type="hidden" name="delete" value={joinPath(currentDirectory, folder)} />
						<Button type="submit" size="sm" formaction={deleteAction} onclick={confirmDelete}>
							<Trash2 class="mr-1.5 size-4" />
							<span>Eliminar</span>
						</Button>
					</form>
				</div>
			</div>
		{/each}
	</div>
</div>
