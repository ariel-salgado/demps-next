<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { toast } from 'svelte-sonner';
	import { source } from 'sveltekit-sse';
	import { Button } from '$lib/components/ui';
	import { Play, Square } from 'lucide-svelte';

	let onProgress: boolean = $state(false);

	// Server-Sent Events
	let status: Readable<string> | undefined = $state();
	let ready: Readable<string> | undefined = $state();
	let agents: Readable<[number, number][]> | undefined = $state();

	const connection = source('/api/simulation', {
		open: () => {
			ready = connection.select('ready');
			toast.loading('Conectando con el servidor...');
		},
		close: () => {
			onProgress = false;
			toast.success('Conexión con el servidor cerrada.');
		},
		error: ({ error }) => {
			toast.error('Error en la conexión.', {
				description: error?.message
			});
		}
	});

	// When the simulator is ready
	$effect(() => {
		if ($ready === 'success') {
			onProgress = true;
			toast.loading('Iniciando simulación...');
		}
	});

	// When the coordinates are received
	$effect(() => {
		if (onProgress) {
			agents = connection.select('agents').transform((data) => {
				const coordinates = data.split('\n').map((coord) => coord.split(',').map(Number));
				return coordinates;
			});
		}
	});

	// When the simulation is ending
	$effect(() => {
		if ($status === 'ending') {
			toast.info('Finalizando simulación...');
		}
	});

	function startSimulation() {
		status = connection.select('status');
	}

	function stopSimulation() {
		connection.close();
	}
</script>

{#if !onProgress}
	<Button onclick={startSimulation} disabled={onProgress}>
		<Play class="mr-1.5 size-4" />
		<span>Iniciar</span>
	</Button>
{:else}
	<Button onclick={stopSimulation}>
		<Square class="mr-1.5 size-4" />
		<span>Detener</span>
	</Button>
{/if}

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
