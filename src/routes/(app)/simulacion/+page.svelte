<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { toast } from 'svelte-sonner';
	import { source } from 'sveltekit-sse';
	import { Button } from '$lib/components/ui';
	import { Play, Square, LoaderCircle } from 'lucide-svelte';

	let onProgress: boolean = $state(false);

	// SSE Connection
	let connection: ReturnType<typeof source> | undefined = $state();

	// Server-Sent Events
	let status: Readable<string> | undefined = $state();
	let agents: Readable<[number, number][]> | undefined = $state();

	$effect(() => {
		// When the simulation is ready
		if ($status === 'ready') {
			onProgress = true;
			toast.loading('Iniciando simulación...', {
				duration: 5000,
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
			agents = connection?.select('agents').transform((data) => {
				const coordinates = data.split('\n').map((coord) => coord.split(',').map(Number));
				return coordinates;
			});
		}
	});

	function createConnection() {
		return source('/api/simulation', {
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

<section>
	<div>
		<Button onclick={startSimulation} disabled={onProgress}>
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

	{#if onProgress}
		{#await import('$lib/components/leaflet/map/map.svelte') then Map}
			{#await import('$lib/components/leaflet/mask-canvas/mask-canvas.svelte') then Canvas}
				<svelte:component this={Map.default}>
					{#if $agents}
						<svelte:component this={Canvas.default} coordinates={$agents} />
					{/if}
				</svelte:component>
			{/await}
		{/await}
	{/if}
</section>
