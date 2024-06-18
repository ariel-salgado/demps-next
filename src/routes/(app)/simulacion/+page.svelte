<script lang="ts">
	import type { SubmitFunction } from '@sveltejs/kit';

	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui';
	import { Play, Square } from 'lucide-svelte';

	let onProgress: boolean = $state(false);

	const handleSubmit: SubmitFunction = ({ action, cancel }) => {
		const formAction = action.search.includes('start') ? 'start' : 'stop';

		if (onProgress && formAction === 'start') {
			toast.info('Ya hay una simulación en progreso');
			cancel();
		} else if (!onProgress && formAction === 'stop') {
			toast.info('No hay ninguna simulación en progreso');
			cancel();
		}

		return async ({ result }) => {
			if (result.type === 'success') {
				if (onProgress && formAction === 'stop') {
					toast.loading('Deteniendo simulación...');
					onProgress = false;
				} else if (!onProgress && formAction === 'start') {
					toast.loading('Iniciando simulación...');
					onProgress = true;
				}
			}
		};
	};
</script>

<form method="POST" use:enhance={handleSubmit}>
	<Button type="submit" formaction="?/start">
		<Play class="mr-1.5 size-4" />
		<span>Iniciar</span>
	</Button>

	<Button type="submit" formaction="?/stop">
		<Square class="mr-1.5 size-4" />
		<span>Detener</span>
	</Button>
</form>
