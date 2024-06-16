<script lang="ts">
	import { Toaster } from 'svelte-sonner';

	const { children } = $props();
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]">
	<header></header>

	<main>
		{@render children()}
	</main>

	<footer></footer>
</div>

<Toaster position="bottom-left" />
