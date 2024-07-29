<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { FormField, FormSchema, ParametersSchema } from '$lib/types';

	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { parameters } from '$lib/states';
	import { onDestroy, onMount } from 'svelte';
	import { parametersFormFields } from '$lib/config';
	import { Explorer } from '$lib/components/file-explorer';
	import { CloudUpload, Database, Download, Save } from 'lucide-svelte';
	import { deflattenJSON, flattenJSON, splitCamelCase } from '$lib/utils';
	import { PUBLIC_BASE_DIR, PUBLIC_PARAMETERS_FILENAME, PUBLIC_SIM_DIR } from '$env/static/public';
	import {
		FormGroup,
		Label,
		Input,
		Select,
		Description,
		Button,
		Dialog,
		PathPicker
	} from '$lib/components/ui';

	// Config file related
	let configFileName: string | null = $state(null);
	let showConfigDialog: boolean = $state(false);
	let selectedConfigFile: string | null = $state(null);

	let files: FileList | null = $state(null);
	let form: HTMLFormElement | undefined = $state();
	let selected: string | null = $state($page.url.hash.slice(1) || 'general');

	onMount(() => {
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

	// TODO: Handle relative paths
	const handleFormVerification: SubmitFunction = async () => {
		return async ({ result, action }) => {
			if (result.type !== 'success' || !result.data) {
				toast.error('Error al descargar configuración', {
					description: 'Ocurrió un error al generar el archivo de configuración.'
				});
				return;
			}

			if ('errors' in result.data) {
				Object.keys(result.data.errors).forEach((id, index) => {
					const el = document.getElementById(id);
					const event = new Event('change', { bubbles: true, cancelable: true });
					el?.dispatchEvent(event);

					if (index === Object.keys(result.data!.errors).length - 1) {
						el?.scrollIntoView({
							behavior: 'smooth',
							block: 'center'
						});
					}
				});
				toast.error('Error al descargar configuración', {
					description: 'Corrija los errores en el formulario antes de descargar la configuración.'
				});
				return;
			}

			const parsedData = deflattenJSON(result.data) as ParametersSchema;
			const data = JSON.stringify(parsedData, null, '\t');

			// Download the file
			if (action.search.includes('download')) {
				const blob = new Blob([data], { type: 'application/json' });
				const url = URL.createObjectURL(blob);

				const a = document.createElement('a');
				a.href = url;
				a.download = PUBLIC_PARAMETERS_FILENAME;

				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);

				URL.revokeObjectURL(url);

				toast.success('Configuración válida', {
					description: `El archivo ${PUBLIC_PARAMETERS_FILENAME} se ha descargado con exito.`
				});

				return;
			}

			// Upload th file
			if (action.search.includes('verify')) {
				if (!configFileName) {
					toast.error('Error al guardar configuración', {
						description: 'Ingrese un nombre para el archivo de configuración.'
					});
					return;
				}

				const response = await fetch('/api/file/create', {
					method: 'POST',
					body: JSON.stringify({
						data,
						fileName: `${configFileName}.config`,
						path: PUBLIC_SIM_DIR
					}),
					headers: {
						'Content-Type': 'application/json'
					}
				});

				const { error, path, fileName } = await response.json();

				if (error) {
					toast.error('Error al guardar configuración', {
						description: error.message
					});
					return;
				}

				toast.success('Configuración guardada correctamente', {
					description: `El archivo ${fileName} se guardó en ${path}`
				});
			}
		};
	};

	async function onConfigSelected() {
		const response = await fetch('/api/file/get', {
			method: 'POST',
			body: JSON.stringify({ path: selectedConfigFile }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error, data } = await response.json();

		if (error) {
			toast.error('Error', {
				description: error.message
			});
			showConfigDialog = false;
			return;
		}

		try {
			const loadedData = flattenJSON(JSON.parse(data));

			const fieldNames = Array.from(form!.elements)
				.filter((element) => element.hasAttribute('name'))
				.map((element) => element.getAttribute('name'));

			if (Object.keys(loadedData).every((element) => fieldNames.includes(element))) {
				parameters.value = loadedData;
				toast.success('Configuración cargada correctamente');
			} else {
				toast.error('Archivo de configuración inválido');
			}
		} catch {
			toast.error('Archivo de configuración inválido');
		} finally {
			selectedConfigFile = null;
			showConfigDialog = false;
		}
	}
</script>

<svelte:head>
	<title>DEMPS | Parametros</title>
	<meta name="description" content="Configuración de parámetros" />
</svelte:head>

<Dialog bind:show={showConfigDialog}>
	<Explorer
		directory={PUBLIC_BASE_DIR}
		bind:selected={selectedConfigFile}
		onSelected={onConfigSelected}
		extensions={['.config']}
		includeFolders={false}
	/>
</Dialog>

<section class="grid grid-cols-[20rem_1fr_20rem] divide-x divide-slate-300">
	<aside
		class="sticky top-16 flex h-[calc(100vh-4rem)] flex-1 flex-col justify-between p-10 *:overflow-hidden"
	>
		<div>
			<h2 class="border-b border-slate-300 pb-2 text-2xl font-semibold tracking-tight">
				Parámetros
			</h2>
			<nav>
				<ul class="space-y-1 py-4">
					{@render navItems(parametersFormFields, false)}
				</ul>
			</nav>
		</div>
	</aside>
	<form
		id="parameters-form"
		class="grid min-w-[32rem] grid-cols-2 gap-4 py-8 px-12"
		bind:this={form}
		method="POST"
		use:enhance={handleFormVerification}
		data-sveltekit-keepfocus
	>
		{@render parametersForm(parametersFormFields, false)}
	</form>
	<aside class="sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-y-4 p-10">
		<h2 class="border-b border-slate-300 pb-2 text-2xl font-semibold tracking-tight">Opciones</h2>

		<div class="flex-1 space-y-8">
			<div class="space-y-2">
				<Button
					class="w-full p-0"
					aria-label="Cargar archivo de configuración local"
					title="Cargar archivo de configuración local"
				>
					<label
						class="flex size-full w-full cursor-pointer items-center justify-center p-1.5"
						for="fileUpload"
					>
						<CloudUpload class="mr-2 size-5" />
						<span class="text-base">Subir archivo</span>
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
				<Description>Subir un archivo local para modificar en la página.</Description>
			</div>

			<div class="space-y-2">
				<Button
					class="w-full p-0"
					aria-label="Cargar archivo de configuración del servidor"
					title="Cargar archivo de configuración del servidor"
					onclick={() => (showConfigDialog = true)}
				>
					<Database class="mr-2 size-5" />
					<span class="text-base">Cargar archivo</span>
				</Button>
				<Description>Cargar un archivo desde el servidor para modificar en la página.</Description>
			</div>

			<div class="space-y-2">
				<Button
					type="submit"
					class="w-full p-0"
					form="parameters-form"
					formaction="?/download"
					aria-label="Descargar archivo de configuración actual"
					title="Descargar archivo de configuración actual"
				>
					<Download class="mr-2 size-5" />
					<span class="text-base">Descargar archivo</span>
				</Button>
				<Description>Validar la configuración actual y descargar.</Description>
			</div>
		</div>

		<div class="*:mt-2">
			<Label for="config-name">Guardar como:</Label>
			<div class="flex gap-x-1.5">
				<Input
					id="config-name"
					name="config-name"
					placeholder="Nombre archivo de configuración"
					bind:value={configFileName}
				/>
				<Button
					type="submit"
					class="size-9"
					size="icon"
					form="parameters-form"
					formaction="?/verify"
				>
					<Save class="size-5" />
				</Button>
			</div>
			<Description>
				El archivo de configuración se guardará con este nombre y la extensión .config.
			</Description>
		</div>
	</aside>
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
		{:else if field.type === 'explorer'}
			<PathPicker
				id={field.attributes.name}
				{...field.attributes}
				{...field.props}
				validation={field.validation}
				bind:value={parameters.value[field.attributes.name! as keyof ParametersSchema]}
			/>
		{/if}
		{#if field.description}
			<Description>{field.description}</Description>
		{/if}
	</FormGroup>
{/snippet}
