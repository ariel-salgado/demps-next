<script lang="ts">
	import { Toaster } from 'svelte-sonner';
	import { Header } from '$lib/components/ui';

	const { children } = $props();
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer></footer>
</div>

<Toaster position="bottom-left" />
