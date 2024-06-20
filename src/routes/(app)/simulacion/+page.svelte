<script lang="ts">
	import { source } from 'sveltekit-sse';
	import { Button } from '$lib/components/ui';
	import { Play, Square } from 'lucide-svelte';

	let value = $state(source('/api/simulation').select('message'));
</script>

<Button>
	<Play class="mr-1.5 size-4" />
	<span>Iniciar</span>
</Button>

<Button>
	<Square class="mr-1.5 size-4" />
	<span>Detener</span>
</Button>

<p>
	value: {$value}
</p>
