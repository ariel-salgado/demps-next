<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { toast } from 'svelte-sonner';
	import { joinPath } from '$lib/utils';
	import { source } from 'sveltekit-sse';
	import { parameters } from '$lib/states';
	import { Explorer } from '$lib/components/file-explorer';
	import { Map, MaskCanvas } from '$lib/components/leaflet';
	import { Play, Square, LoaderCircle } from 'lucide-svelte';
	import { Button, Label, Select, Dialog } from '$lib/components/ui';
	import { PUBLIC_BASE_DIR, PUBLIC_PARAMETERS_FILENAME, PUBLIC_SIM_DIR } from '$env/static/public';

	type Coordinates = [number, number][];

	const parametersOptions = $state([
		{ value: 'default', label: 'Usar por defecto' },
		{ value: 'custom', label: 'Cargar configuración' }
	]);

	let parametersDir: string = $state(PUBLIC_BASE_DIR);

	let onProgress: boolean = $state(false);
	let showParametersDialog: boolean = $state(false);
	let selectedParameterConfig: string = $state('default');

	// SSE Connection
	let connection: ReturnType<typeof source> | undefined = $state();

	// Server-Sent Events
	let status: Readable<string> | undefined = $state();
	let agents:
		| Readable<{
				residents: Coordinates;
				visitants: Coordinates;
				dead: Coordinates;
		  }>
		| undefined = $state();
	let flood:
		| Readable<{
				flood_1m: Coordinates;
				flood_2m: Coordinates;
				flood_4m: Coordinates;
				flood_6m: Coordinates;
				flood_plus_6m: Coordinates;
		  }>
		| undefined = $state();

	$effect(() => {
		if (selectedParameterConfig === 'custom') {
			showParametersDialog = true;
		}
	});

	$effect(() => {
		// When the simulation is ready
		if ($status === 'ready') {
			onProgress = true;

			const simPromise = new Promise((resolve, reject) => {
				const interval = setInterval(() => {
					//@ts-expect-error - Typescript infers that status will always be "start".
					if ($status === 'error') {
						clearInterval(interval);
						reject();
					} else if (!onProgress) {
						clearInterval(interval);
						reject();
					} else if ($agents) {
						clearInterval(interval);
						resolve('Simulación iniciada.');
					}
				}, 1000);
			});

			toast.promise(simPromise as Promise<string>, {
				loading: 'Iniciando simulación. Por favor, espere...',
				success: (message) => {
					return message;
				},
				error: 'Simulación abortada.'
			});
		}

		// When an error occurs
		if ($status === 'error') {
			stopSimulation();
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
			agents = connection?.select('agents').transform((data) => {
				if (!data) return;

				const parseAgentData = (data: string[]) => {
					const deadAgents: Coordinates = [];
					const residentAgents: Coordinates = [];
					const visitantAgents: Coordinates = [];

					for (const agentData of data) {
						const [lat, lng, isVisitant, isAlive] = agentData.split(',');

						if (+isAlive) {
							if (+isVisitant) {
								visitantAgents.push([+lat, +lng]);
							} else {
								residentAgents.push([+lat, +lng]);
							}
						} else {
							deadAgents.push([+lat, +lng]);
						}
					}

					return {
						residents: residentAgents,
						visitants: visitantAgents,
						dead: deadAgents
					} as typeof $agents;
				};

				const mappedAgentData = data.split('$').filter(Boolean);

				return parseAgentData(mappedAgentData);
			});

			flood = connection?.select('flood').transform((data) => {
				if (!data) return;

				const parseFloodData = (data: string[]) => {
					const floods_1m: Coordinates = [];
					const floods_2m: Coordinates = [];
					const floods_4m: Coordinates = [];
					const floods_6m: Coordinates = [];
					const floods_plus_6m: Coordinates = [];

					for (const floodData of data) {
						const [lat, lng, depth] = floodData.split(',');

						if (+depth === 1) floods_1m.push([+lng, +lat]);
						else if (+depth === 2) floods_2m.push([+lng, +lat]);
						else if (+depth === 4) floods_4m.push([+lng, +lat]);
						else if (+depth === 6) floods_6m.push([+lng, +lat]);
						else if (+depth > 6) floods_plus_6m.push([+lng, +lat]);
					}

					return {
						flood_1m: floods_1m,
						flood_2m: floods_2m,
						flood_4m: floods_4m,
						flood_6m: floods_6m,
						flood_plus_6m: floods_plus_6m
					} as typeof $flood;
				};

				const mappedFloodData = data.split('$').filter(Boolean);

				return parseFloodData(mappedFloodData);
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

		startSimulation();
	}

	async function handleExistingConfigFile() {
		const path = joinPath(PUBLIC_SIM_DIR, PUBLIC_PARAMETERS_FILENAME);

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

		toast.info('Archivo de configuración.', {
			description: 'El archivo de configuración ha sido modificado.'
		});

		return false;
	}

	function createConnection() {
		return source('/api/simulator/run', {
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
		onProgress = false;
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
			{#if $agents}
				{@const { residents, visitants, dead } = $agents}

				{#if residents}
					<MaskCanvas coordinates={residents} color={'#0000FF'} lineColor={'#0000DD'} />
				{/if}
				{#if visitants}
					<MaskCanvas coordinates={visitants} color={'#00FF00'} lineColor={'#00DD00'} />
				{/if}
				{#if dead}
					<MaskCanvas coordinates={dead} color={'#FF0000'} lineColor={'#DD0000'} />
				{/if}
			{/if}
			{#if $flood}
				{@const { flood_1m, flood_2m, flood_4m, flood_6m, flood_plus_6m } = $flood}

				{#if flood_1m}
					<MaskCanvas
						coordinates={flood_1m}
						color={'#C8C8FF'}
						lineColor={'#C8C8FF'}
						radius={10}
						opacity={0.5}
					/>
				{/if}
				{#if flood_2m}
					<MaskCanvas
						coordinates={flood_2m}
						color={'#9696FF'}
						lineColor={'#9696FF'}
						radius={10}
						opacity={0.5}
					/>
				{/if}
				{#if flood_4m}
					<MaskCanvas
						coordinates={flood_4m}
						color={'#6464FF'}
						lineColor={'#6464FF'}
						radius={10}
						opacity={0.5}
					/>
				{/if}
				{#if flood_6m}
					<MaskCanvas
						coordinates={flood_6m}
						color={'#3232FF'}
						lineColor={'#3232FF'}
						radius={10}
						opacity={0.5}
					/>
				{/if}
				{#if flood_plus_6m}
					<MaskCanvas
						coordinates={flood_plus_6m}
						color={'#0000FF'}
						lineColor={'#0000FF'}
						radius={10}
						opacity={0.5}
					/>
				{/if}
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
