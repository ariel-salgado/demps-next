<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { PathPickerProps } from '$lib/types';
	import type { HTMLInputAttributes } from 'svelte/elements';

	import { cn } from '$lib/utils';
	import { Dialog } from '$lib/components/ui';
	import { File, Folder } from 'lucide-svelte';
	import { Explorer } from '$lib/components/file-explorer';

	type Props = PathPickerProps & HTMLInputAttributes;

	let {
		basePath,
		initialPath,
		validation,
		onSelected,
		extensions = null,
		includeFiles = true,
		includeFolders = true,
		isFile = $bindable(false),
		disableBacktracking = false,
		isRelativeTo,
		value: value = $bindable(),
		class: className,
		...rest
	}: Props = $props();

	let showDialog: boolean = $state(false);
	let validationError: boolean = $state(false);

	let inputError: string | undefined = $state();
	let inputElement: HTMLInputElement | undefined = $state();

	function handleSelected() {
		showDialog = false;
		inputElement!.scrollLeft = inputElement!.scrollWidth;

		if (validation) {
			validateField();
		}

		if (onSelected) {
			onSelected();
		}
	}

	function validateField() {
		if (!validation) return;

		const { success, error } = validation.safeParse(value);

		if (success) {
			validationError = false;
			return;
		}

		validationError = true;
		inputError = error.format()._errors.at(0);
	}

	function getFolderPath(path: string) {
		if (!isFile) return path;

		return path.replace(/[^/]*$/, '').replace(/\/$/, '');
	}

	const initPathPicker: Action<HTMLInputElement> = (inputElement: HTMLInputElement) => {};
</script>

<Dialog
	bind:show={showDialog}
	onClose={() => (inputElement!.scrollLeft = inputElement!.scrollWidth)}
>
	<Explorer
		{basePath}
		directory={initialPath || getFolderPath(value)}
		bind:selected={value}
		bind:isFile
		{extensions}
		{includeFolders}
		{includeFiles}
		onSelected={handleSelected}
		{disableBacktracking}
		{isRelativeTo}
	/>
</Dialog>

<div
	class:error={validationError}
	class={cn(
		'flex h-9 items-center divide-x divide-slate-300 overflow-hidden rounded-md border border-slate-300 bg-white text-sm ring-offset-white focus-within:ring-2 focus-within:ring-slate-700 focus-within:ring-offset-2 focus-within:outline-none',
		`${validationError ? 'border-2 border-red-600 focus-within:ring-red-600' : ''}`,
		className
	)}
>
	<button
		type="button"
		class="flex size-9 cursor-pointer items-center justify-center rounded-l-md bg-slate-200/80 p-2"
		onclick={() => (showDialog = true)}
	>
		{#if isFile}
			<File class="size-[18px]" />
		{:else}
			<Folder class="size-[18px]" />
		{/if}
	</button>
	<input
		bind:this={inputElement}
		class="w-full border-none px-3 focus-within:outline-none"
		bind:value
		use:initPathPicker
		{...rest}
	/>
</div>

{#if validationError}
	<small class="text-red-600">{inputError}</small>
{/if}
