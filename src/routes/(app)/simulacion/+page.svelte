<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { toast } from 'svelte-sonner';
	import { source } from 'sveltekit-sse';
	import { parameters } from '$lib/states';
	import { PUBLIC_DEMPS_DIR } from '$env/static/public';
	import { Explorer } from '$lib/components/file-explorer';
	import { Map, MaskCanvas } from '$lib/components/leaflet';
	import { Play, Square, LoaderCircle } from 'lucide-svelte';
	import { Button, Label, Select, Dialog } from '$lib/components/ui';
	import { defaultParametersConfigFilename } from '$lib/config';
	import { joinPath } from '$lib/utils';

	const parametersOptions = $state([
		{ value: 'default', label: 'Usar por defecto' },
		{ value: 'custom', label: 'Cargar configuración' }
	]);

	let parametersDir: string = $state(PUBLIC_DEMPS_DIR);

	let onProgress: boolean = $state(false);
	let showParametersDialog: boolean = $state(false);
	let selectedParameterConfig: string = $state('default');

	// SSE Connection
	let connection: ReturnType<typeof source> | undefined = $state();

	// Server-Sent Events
	let status: Readable<string> | undefined = $state();
	let coordinates: Readable<[number, number][]> | undefined = $state();

	$effect(() => {
		if (selectedParameterConfig === 'custom') {
			showParametersDialog = true;
		}
	});

	$effect(() => {
		// When the simulation is ready
		if ($status === 'ready') {
			onProgress = true;
			toast.loading('Iniciando simulación...', {
				duration: 25000,
				description: 'Esperando datos de los agentes. Por favor, espere...'
			});
		}

		// When an error occurs
		if ($status === 'error') {
			stopSimulation();
			toast.error('Error conectando con el simulador.', {
				description: 'Conexión con el servidor finalizada.'
			});
		}

		// When the simulation finishes successfully
		if ($status === 'finished') {
			stopSimulation();
			toast.success('Simulación finalizada.', {
				description:
					'La simulación ha finalizado correctamente. Conexión con el servidor finalizada.'
			});
		}
	});

	// When the coordinates are received
	$effect(() => {
		if (onProgress) {
			coordinates = connection?.select('agents').transform((data) => {
				const coordinates = data.split('$').map((coord) => coord.split(',').map(Number));
				return coordinates;
			});
		}
	});

	function handleSelectedParameterConfig() {
		if (parametersOptions.length > 2) {
			parametersOptions.pop();
		}

		parametersOptions.push({
			value: selectedParameterConfig,
			label: selectedParameterConfig.split('/').at(-1)!
		});

		showParametersDialog = false;
	}

	async function setupSimulation() {
		toast.loading('Preparando simulación', {
			description: 'Verificando configuración de los parámetros.'
		});

		const type = selectedParameterConfig === 'default' ? 'local' : 'server';
		const config = type === 'local' ? $state.snapshot(parameters.value) : selectedParameterConfig;

		if (type === 'local') {
			const abort = await handleExistingConfigFile();

			if (abort) return;
		}

		const response = await fetch('/api/simulator/setup', {
			method: 'POST',
			body: JSON.stringify({ type, config }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error } = await response.json();

		if (error) {
			toast.error('Error en la configuración.', {
				description: error.message
			});
			return;
		}

		toast.success('Configuración valida.', {
			description: 'Iniciando simulación.'
		});
	}

	async function handleExistingConfigFile() {
		const path = joinPath(parameters.value.baseDirSim!, defaultParametersConfigFilename);

		const fileExistsResponse = await fetch('/api/file/get', {
			method: 'POST',
			body: JSON.stringify({ path }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { data: fileExists } = await fileExistsResponse.json();

		if (!fileExists) {
			return false;
		}

		const wantToOverwrite = confirm(
			'El archivo de configuración creado a partir del formulario ya existe. ¿Desea sobreescribirlo?'
		);

		if (!wantToOverwrite) {
			return true;
		}
		const fileDeleteResponse = await fetch('/api/file/delete', {
			method: 'DELETE',
			body: JSON.stringify({ path }),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		const { error } = await fileDeleteResponse.json();

		if (error) {
			toast.error('Error al sobreescribir el archivo de configuración.', {
				description: error.message
			});

			return true;
		}

		toast.info('Sobreescribir archivo.', {
			description: 'El archivo de configuración será sobreescribido.'
		});

		return false;
	}

	function createConnection() {
		return source('/api/simulator/run', {
			close: () => {
				onProgress = false;
			},
			error: ({ error }) => {
				toast.error('Error en la conexión.', {
					description: error?.message
				});
			}
		});
	}

	function startSimulation() {
		connection = createConnection();
		status = connection?.select('status');
	}

	function stopSimulation() {
		connection?.close();
	}
</script>

<Dialog
	bind:show={showParametersDialog}
	onClose={() => {
		if (selectedParameterConfig === 'custom') selectedParameterConfig = 'default';
	}}
>
	<Explorer
		bind:directory={parametersDir}
		bind:selected={selectedParameterConfig}
		includeFolders={false}
		extensions={['.config']}
		onSelected={handleSelectedParameterConfig}
	/>
</Dialog>

<section class="flex size-full divide-x divide-slate-300">
	<div class="size-full">
		<Map>
			{#if $coordinates}
				<MaskCanvas coordinates={$coordinates} color={'#7E4BB9'} lineColor={'#6A3D9E'} />
			{/if}
		</Map>
	</div>
	<aside class="flex w-[24rem] flex-col gap-y-6 py-8 px-10">
		<div class="space-y-4">
			<h2 class="border-b border-slate-300 pb-2 text-2xl font-semibold tracking-tight">
				Simulación
			</h2>

			<div class="space-y-2 *:w-full">
				<Button onclick={setupSimulation} disabled={onProgress}>
					{#if onProgress}
						<LoaderCircle class="mr-1.5 size-4 animate-spin" />
						<span>En progreso...</span>
					{:else}
						<Play class="mr-1.5 size-4" />
						<span>Iniciar</span>
					{/if}
				</Button>

				<Button onclick={stopSimulation} disabled={!onProgress}>
					<Square class="mr-1.5 size-4" />
					<span>Detener</span>
				</Button>
			</div>
		</div>

		<div class="space-y-4">
			<h3 class="border-b border-slate-300 pb-1 text-xl font-semibold tracking-tight">
				Parámetros
			</h3>

			<div class="*:mt-2">
				<Label>Archivo de configuración</Label>
				<Select options={parametersOptions} bind:value={selectedParameterConfig} />
			</div>
		</div>
	</aside>
</section>
