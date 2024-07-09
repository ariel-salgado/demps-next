<script lang="ts">
	import type { PageData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { FormField, FormSchema, ParametersSchema } from '$lib/types';

	import { on } from 'svelte/events';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { parameters } from '$lib/states';
	import { onDestroy, onMount } from 'svelte';
	import { Download, Upload } from 'lucide-svelte';
	import { parametersFormFields } from '$lib/config';
	import { Explorer } from '$lib/components/file-explorer';
	import { deflattenJSON, flattenJSON, splitCamelCase } from '$lib/utils';
	import { FormGroup, Label, Input, Select, Description, Button, Dialog } from '$lib/components/ui';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const baseDirInitValue = (
		data.baseDir !== parameters.value.baseDirSim ? parameters.value.baseDirSim : data.baseDir
	) as string;

	let showDialog: boolean = $state(false);
	let form: HTMLFormElement | undefined = $state();
	let selectedPath: string = $state(baseDirInitValue);
	let currentDirectory: string = $state(baseDirInitValue);

	let files: FileList | null = $state(null);
	let selected: string | null = $state($page.url.hash.slice(1) || 'general');

	$effect(() => {
		parameters.value['baseDirSim'] = selectedPath;
	});

	onMount(() => {
		attachDialog();

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const sectionId = entry.target.id;

					if (entry.isIntersecting) {
						selected = sectionId;
					}
				}
			},
			{ threshold: 1, rootMargin: '-12px 0px -75% 0px' }
		);

		const sections = document.querySelectorAll('.observed');

		for (const section of sections) {
			observer.observe(section);
		}
	});

	onDestroy(() => {
		files = null;
		selected = null;
		form?.remove();
	});

	function handleUpload({ target }: Event) {
		if (!!files && files.length > 0) {
			const reader = new FileReader();

			reader.onload = () => {
				const uploadedData = reader.result as string;

				try {
					const data = flattenJSON(JSON.parse(uploadedData));

					const fieldNames = Array.from(form!.elements)
						.filter((element) => element.hasAttribute('name'))
						.map((element) => element.getAttribute('name'));

					if (Object.keys(data).every((element) => fieldNames.includes(element))) {
						parameters.value = data;
						selectedPath = data.baseDirSim as string;
						toast.success('Configuración cargada correctamente');
					} else {
						toast.error('Archivo de configuración inválido');
					}
				} catch {
					toast.error('Archivo de configuración inválido');
				} finally {
					(target! as HTMLInputElement).value = '';
				}
			};

			const file = files[0] as File;
			const blob = new Blob([file], { type: file.type });

			reader.readAsText(blob);
		}
	}

	const handleSubmit: SubmitFunction = async () => {
		return async ({ result }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error al descargar configuración', {
					description: 'Ocurrió un error al generar el archivo de configuración.'
				});
				return;
			}

			if ('errors' in result.data) {
				Object.keys(result.data.errors).forEach((id) => {
					const el = document.getElementById(id);
					const event = new Event('change', { bubbles: true, cancelable: true });
					el?.dispatchEvent(event);
				});
				toast.error('Error al descargar configuración', {
					description: 'Corrija los errores en el formulario antes de descargar la configuración.'
				});
				return;
			}

			const parsedData = deflattenJSON(result.data) as ParametersSchema;
			const data = JSON.stringify(addInputOutputPrefixes(parsedData), null, 2);

			const blob = new Blob([data], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = 'parameters.config';

			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);

			URL.revokeObjectURL(url);
		};
	};

	function addInputOutputPrefixes(data: ParametersSchema) {
		data.input.directory = `input/${data.input.directory}`;
		data.output.directory = `output/${data.output.directory}`;
		return data;
	}

	function attachDialog() {
		const baseDirSim = document.querySelector('input[name="baseDirSim"]') as HTMLInputElement;

		const onClick = on(baseDirSim, 'click', () => {
			showDialog = true;
		});

		const onFocus = on(baseDirSim, 'focus', () => {
			showDialog = true;
		});

		return () => {
			onClick();
			onFocus();
		};
	}

	function onPathSelected() {
		setTimeout(() => {
			showDialog = false;
		}, 300);
	}
</script>

<svelte:head>
	<title>DEMPS | Parametros</title>
	<meta name="description" content="Configuración de parámetros" />
</svelte:head>

<Dialog bind:show={showDialog}>
	<Explorer
		bind:currentDirectory
		folderAction="?/getDirectories"
		deleteAction="?/deleteDirectory"
		bind:selectedPath
		onSelect={onPathSelected}
	/>
</Dialog>

<section class="grid grid-cols-[20rem_1fr] divide-x divide-slate-300">
	<aside class="sticky top-16 flex h-[calc(100vh-4rem)] flex-1 flex-col justify-between p-10">
		<div>
			<h2 class="border-b border-slate-300 pb-2 text-3xl font-semibold tracking-tight">
				Navegación
			</h2>
			<nav>
				<ul class="space-y-1 py-4">
					{@render navItems(parametersFormFields, false)}
				</ul>
			</nav>
		</div>
		<div class="flex gap-3">
			<Button
				class="w-full p-0"
				aria-label="Cargar archivo de configuración"
				title="Cargar configuración"
			>
				<label
					class="flex size-full w-full cursor-pointer items-center justify-center p-1.5"
					for="fileUpload"
				>
					<Upload class="size-5" />
				</label>

				<input
					id="fileUpload"
					type="file"
					class="hidden"
					accept=".config"
					bind:files
					onchange={handleUpload}
				/>
			</Button>

			<Button
				type="submit"
				class="w-full p-0"
				form="parameters-form"
				title="Descargar configuración"
			>
				<Download class="size-5" />
			</Button>
		</div>
	</aside>
	<form
		id="parameters-form"
		class="grid grid-cols-2 gap-4 py-8 px-12"
		bind:this={form}
		method="POST"
		action="?/download"
		use:enhance={handleSubmit}
		data-sveltekit-keepfocus
	>
		{@render parametersForm(parametersFormFields, false)}
	</form>
</section>

{#snippet navItems(items: FormSchema, isNested: boolean)}
	{#each Object.entries(items) as [key, value]}
		{@const isSelected = selected === key}
		<li
			class={`rounded-md text-base font-medium text-slate-500 transition-colors focus-within:bg-slate-100 focus-within:text-slate-700 hover:bg-slate-100 hover:text-slate-700 ${isNested && `pl-4`} ${isSelected && `bg-slate-700 text-white focus-within:bg-slate-700/85 focus-within:text-white hover:bg-slate-700/85 hover:text-white`}`}
		>
			<a href={`#${key}`} class="block py-1.5 px-4 capitalize">{splitCamelCase(key)}</a>
		</li>

		{#if !Array.isArray(value)}
			{@render navItems(value, true)}
		{/if}
	{/each}
{/snippet}

{#snippet parametersForm(fields: FormSchema, isNested: boolean)}
	{#each Object.entries(fields) as [key, value]}
		{#if isNested}
			<h3
				id={key}
				class="observed col-span-2 mt-4 scroll-m-24 px-5 text-2xl font-semibold capitalize tracking-tight"
			>
				{key}
			</h3>
		{:else}
			<h2
				id={key}
				class="observed col-span-2 mt-2 scroll-m-[6.5rem] border-b border-slate-300 px-5 pb-2 text-3xl font-semibold capitalize tracking-tight"
			>
				{key}
			</h2>
		{/if}
		{#if Array.isArray(value)}
			{#each value as field}
				{@render formField(field)}
			{/each}
		{:else}
			{@render parametersForm(value, true)}
		{/if}
	{/each}
{/snippet}

{#snippet formField(field: FormField)}
	<FormGroup>
		<Label for={field.attributes.name}>{field.label}</Label>
		{#if field.type === 'input'}
			<Input
				id={field.attributes.name}
				{...field.attributes}
				validation={field.validation}
				bind:value={parameters.value[field.attributes.name! as keyof ParametersSchema]}
			/>
		{:else if field.type === 'select'}
			<Select
				id={field.attributes.name}
				bind:value={parameters.value[field.attributes.name! as keyof ParametersSchema]}
				{...field.attributes}
				options={field.options}
				validation={field.validation}
			/>
		{/if}
		{#if field.description}
			<Description>{field.description}</Description>
		{/if}
	</FormGroup>
{/snippet}
