<script lang="ts">
	import type { Readable } from 'svelte/store';

	import { toast } from 'svelte-sonner';
	import { source } from 'sveltekit-sse';
	import { Button } from '$lib/components/ui';
	import { Play, Square } from 'lucide-svelte';

	const connection = source('/api/simulation');

	let onProgress: boolean = $state(false);

	let initConnection: Readable<string> | undefined = $state();
	let agentsCoordinates: Readable<[number, number][]> | undefined = $state();

	$effect(() => {
		if ($initConnection === 'success') {
			toast.loading('Iniciando simulación...');
			onProgress = true;
		}
	});

	$effect(() => {
		if (onProgress) {
			agentsCoordinates = connection.select('agentsCoordinates').transform((data) => {
				const coordinates = data.split('\n').map((coord) => coord.split(',').map(Number));
				return coordinates;
			});
		}
	});

	function startSimulation() {
		initConnection = connection.select('initConnection');
	}

	// TODO: Implement stop simulation
	function stopSimulation() {
		connection.close();
		onProgress = false;
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

<!-- TODO: Make canvas reactive, so when the value changes, update the view -->
{#if $initConnection === 'success' && onProgress}
	{#await import('$lib/components/leaflet/map/map.svelte') then Map}
		{#await import('$lib/components/leaflet/mask-canvas/mask-canvas.svelte') then Canvas}
			<svelte:component this={Map.default}>
				{#if $agentsCoordinates}
					<svelte:component this={Canvas.default} coordinates={$agentsCoordinates} />
				{/if}
			</svelte:component>
		{/await}
	{/await}
{/if}
